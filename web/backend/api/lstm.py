from datetime import datetime
print(datetime.now())
#data preprocessing
import numpy as np
from collections import defaultdict
# NN
import torch
import torch.nn as nn
import math

def cap_data(df):
    print("Capping between the {} and {} quantile".format(CAPPING_THRESHOLD_LOWER, CAPPING_THRESHOLD_UPPER))
    cap_mask = df.columns.difference(['icustay_id', 'charttime', 'aki_stage'])
    df[cap_mask] = df[cap_mask].clip(df[cap_mask].quantile(CAPPING_THRESHOLD_LOWER),
                                     df[cap_mask].quantile(CAPPING_THRESHOLD_UPPER),
                                     axis=1)

    return df
 
    
def normalise_data(df, norm_mask):
    print("Normalizing in [0,1] with {} normalization".format(NORMALIZATION))
    
    min_values = df[norm_mask].min()
    max_values = df[norm_mask].max()
    
    # Skip normalization for constant columns
    for column in norm_mask:
        if min_values[column] != max_values[column]:
            df[column] = (df[column] - min_values[column]) / (max_values[column] - min_values[column])
    
    normalization_parameters = {column: {'min': min_values[column], 'max': max_values[column]} for column in norm_mask}
    
    return df, normalization_parameters


# impute missing value in resampleing data with most common based on each id
def fast_mode(df, key_cols, value_col):
    """ Calculate a column mode, by group, ignoring null values. 
    
    key_cols : list of str - Columns to groupby for calculation of mode.
    value_col : str - Column for which to calculate the mode. 

    Return
    pandas.DataFrame
        One row for the mode of value_col per key_cols group. If ties, returns the one which is sorted first. """
    return (df.groupby(key_cols + [value_col]).size() 
              .to_frame('counts').reset_index() 
              .sort_values('counts', ascending=False) 
              .drop_duplicates(subset=key_cols)).drop('counts',axis=1)


#get max shape of 3d array
def get_dimensions(array, level=0):   
    yield level, len(array)
    try:
        for row in array:
            yield from get_dimensions(row, level + 1)
    except TypeError: #not an iterable
        pass

def get_max_shape(array):
    dimensions = defaultdict(int)
    for level, length in get_dimensions(array):
        dimensions[level] = max(dimensions[level], length)
    return [value for _, value in sorted(dimensions.items())]

#pad the ragged 3d array to rectangular shape based on max size
def iterate_nested_array(array, index=()):
    try:
        for idx, row in enumerate(array):
            yield from iterate_nested_array(row, (*index, idx)) 
    except TypeError: # final level            
        yield (*index, slice(len(array))), array # think of the types

def pad(array, fill_value):
    dimensions = get_max_shape(array)
    result = np.full(dimensions, fill_value, dtype = np.float64)  
    for index, value in iterate_nested_array(array):
        result[index] = value 
    return result

def bin_total(y_true, y_prob, n_bins):
    bins = np.linspace(0., 1. + 1e-8, n_bins + 1)

    # In sklearn.calibration.calibration_curve,
    # the last value in the array is always 0.
    binids = np.digitize(y_prob, bins) - 1

    return np.bincount(binids, minlength=len(bins))

def missing_bin(bin_array):
    midpoint = " "    
    if bin_array[0]==0:
        midpoint = "5%, "
    if bin_array[1]==0:
        midpoint = midpoint + "15%, "
    if bin_array[2]==0:
        midpoint = midpoint + "25%, "
    if bin_array[3]==0:
        midpoint = midpoint + "35%, " 
    if bin_array[4]==0:
        midpoint = midpoint + "45%, "
    if bin_array[5]==0:
        midpoint = midpoint + "55%, "
    if bin_array[6]==0:
        midpoint = midpoint + "65%, "
    if bin_array[7]==0:
        midpoint = midpoint + "75%, "
    if bin_array[8]==0:
        midpoint = midpoint + "85%, "
    if bin_array[9]==0:
        midpoint = midpoint + "95%, "
    return "The missing bins have midpoint values of "+ str(midpoint)

def batch(data, batch_size):
    X_batches = []
    y_batches = []
    times = math.floor(data.shape[0]/batch_size)
    remainder = data.shape[0]%times
    a = 0
    start = 0
    end = start+batch_size
    if remainder ==0:
        a +=1
    while a<times:
        temp = pad(data[start:end,],0)
        x = torch.from_numpy(temp[:,:,1:-1]).float() # without icustay_id and without aki_stage columns
        y = torch.flatten(torch.from_numpy(temp[:, :,-1].reshape(-1,1)).float()).long()
        X_batches.append(x)
        y_batches.append(y)
        start = end
        end = start+batch_size
        a +=1
    temp = pad(data[start:data.shape[0]],0)
    x = torch.from_numpy(temp[:,:,1:-1]).float()
    y = torch.flatten(torch.from_numpy(temp[:, :,-1].reshape(-1,1)).float()).long()
    X_batches.append(x)
    y_batches.append(y)
    if len(X_batches) != len(y_batches):
        print("length error")
    return X_batches, y_batches # arrays

class Net(nn.Module):
    def __init__(self, input_size, emb_size, output_size, bi_directional, number_layers, dropout):
        super(Net, self).__init__()
        self.input_size = input_size
        self.emb_size = emb_size 
        self.output_size = output_size
        self.number_layers = number_layers
        self.fc1 = nn.Linear(self.input_size, self.emb_size, bias = True) # I can have a few (IV) within this line - documentation        
        self.fc2 = nn.LSTM(self.emb_size, self.output_size,num_layers=self.number_layers, batch_first = True, bidirectional = bi_directional) 
        # in bidirectional encoder we have  forward and backward hidden states
        self.encoding_size = self.output_size * 2 if bi_directional else self.output_size
        self.combination_layer = nn.Linear(self.encoding_size, self.encoding_size)
        # Create affine layer to project to the classes 
        self.projection = nn.Linear(self.encoding_size, self.output_size)
        #dropout layer for regularizetion of a sequence
        self.dropout_layer = nn.Dropout(p = dropout)  
        self.relu = nn.ReLU()
        
    def forward(self, x):
        h = self.relu(self.fc1(x))
        h, _ = self.fc2(h) # h, _ : as I have 2outputs (tuple), only take the real output [0]. 
        #print(type(h)) # Underscore throughs away the rest, _ "I do not care" variable notation in python
        h = self.relu(self.combination_layer(h))
        h = self.dropout_layer(h)
        h = self.projection(h) 
        return h
    pass