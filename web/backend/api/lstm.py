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
    
    min_values = df[norm_mask].min()
    max_values = df[norm_mask].max()
    
    # Skip normalization for constant columns
    for column in norm_mask:
        if min_values[column] != max_values[column]:
            df[column] = (df[column] - min_values[column]) / (max_values[column] - min_values[column])
    
    normalization_parameters = {column: {'min': min_values[column], 'max': max_values[column]} for column in norm_mask}
    
    return df, normalization_parameters

def normalise_data_with_parameters(df, normalization_parameters):
    # Skip normalization for constant columns
    print(df.columns)
    print(normalization_parameters)
    print(type(normalization_parameters))
    
    for column in normalization_parameters:
        print(column)
        if normalization_parameters[column]['min'] != normalization_parameters[column]['max']:
            df[column] = (df[column] - normalization_parameters[column]['min']) / (normalization_parameters[column]['max'] - normalization_parameters[column]['min'])
            
    return df


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

def batch_predict(data):
    # Assuming data is your features in the shape of (12, number_of_features)
    # Since batch size is 1, we don't need to loop through the data
    temp = data.reshape(1, data.shape[0], -1)  # Reshape to (1, 12, number_of_features)
    x = torch.from_numpy(temp).float() # Convert to tensor and send to device
    return x  # Return the batched tensor ready for prediction

class Net(nn.Module):
    def __init__(self, input_size, emb_size, output_size, bi_directional, number_layers, dropout):
        super(Net, self).__init__()
        self.lstm = nn.LSTM(input_size, emb_size, num_layers=number_layers, 
                            bidirectional=bi_directional, dropout=dropout, batch_first=True)
        self.fc = nn.Linear(emb_size * (2 if bi_directional else 1), output_size)

    def forward(self, x):
        _, (hidden, _) = self.lstm(x)
        
        if self.lstm.bidirectional:
            hidden = torch.cat((hidden[-2,:,:], hidden[-1,:,:]), dim=1)
        else:
            hidden = hidden[-1]
        
        out = self.fc(hidden)
        return out.squeeze(1)