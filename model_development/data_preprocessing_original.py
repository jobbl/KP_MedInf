import os
from datetime import datetime
import pandas as pd
import numpy as np
from sklearn.impute import SimpleImputer
from matplotlib import pyplot as plt
import seaborn as sns

# File paths and separator
DATA_PATH_stages = "data/extracted/kdigo_stages_measured.csv"
DATA_PATH_labs = "data/extracted/labs_original.csv"
DATA_PATH_labs_extended = "data/extracted/labs_extended.csv"
DATA_PATH_labs_new = "data/extracted/labs_new.csv"
DATA_PATH_vitals = "data/extracted/vitals.csv"
DATA_PATH_vents = "data/extracted/vents_vasopressor_sedatives.csv"
DATA_PATH_detail = "data/extracted/icustay_detail.csv"
DATA_PATH_heightweight = "data/extracted/heightweight.csv"
DATA_PATH_calcium = "data/extracted/calcium.csv"
DATA_PATH_inr_max = "data/extracted/inr_max.csv"
SEPARATOR = ";"

# Constants
IMPUTE_EACH_ID = False
IMPUTE_COLUMN = False
TESTING = False
TEST_SIZE = 0.05
SPLIT_SIZE = 0.2
MAX_DAYS = 35
CLASS1 = True
ALL_STAGES = False
MAX_FEATURE_SET = True
FIRST_TURN_POS = True
TIME_SAMPLING = True
SAMPLING_INTERVAL = '6H'
RESAMPLE_LIMIT = 16
MOST_COMMON = False
IMPUTE_METHOD = 'most_frequent'
FILL_VALUE = 0
ADULTS_MIN_AGE = 18
ADULTS_MAX_AGE = 120
NORMALIZATION = 'min-max'
HOURS_AHEAD = 48
NORM_TYPE = 'min_max'
RANDOM = 42

def filter_by_length_of_stay(X):
    drop_list = []
    long_stays = X.groupby(['icustay_id']).apply(lambda group: (group['charttime'].max() - group['charttime'].min()).total_seconds() / (24 * 60 * 60) > MAX_DAYS)

    for icustay_id, is_long in long_stays.items():
        if is_long:
            max_time = X[X['icustay_id'] == icustay_id]['charttime'].max() - pd.to_timedelta(MAX_DAYS, unit='D')
            X = X[~((X['icustay_id'] == icustay_id) & (X['charttime'] < max_time))]

    short_stays = X.groupby(['icustay_id']).apply(lambda group: (group['charttime'].max() - group['charttime'].min()).total_seconds() / (24 * 60 * 60) < (HOURS_AHEAD/24))
    drop_list = short_stays[short_stays].index.tolist()

    X = X[~X.icustay_id.isin(drop_list)]
    return X

# Load datasets
print("Loading datasets...")
X = pd.read_csv(DATA_PATH_stages, sep=SEPARATOR)
X.drop(["aki_stage_creat", "aki_stage_uo"], axis=1, inplace=True)
X = X.dropna(how='all', subset=['creat', 'uo_rt_6hr', 'uo_rt_12hr', 'uo_rt_24hr', 'aki_stage'])
X['charttime'] = pd.to_datetime(X['charttime'])

print(len(X))
print(X['aki_stage'].value_counts())

dataset_detail = pd.read_csv(DATA_PATH_detail, sep=SEPARATOR)
# original data
# out data
dataset_detail.drop(['dod', 'admittime', 'dischtime', 'los_hospital', 'ethnicity', 
                     'hospital_expire_flag', 'hospstay_seq', 'first_hosp_stay', 'intime', 
                     'outtime', 'los_icu', 'icustay_seq', 'first_icu_stay', 'ethnicity_grouped'], axis=1, inplace=True)


dataset_labs = pd.read_csv(DATA_PATH_labs, sep=SEPARATOR)
dataset_labs = dataset_labs.dropna(subset=['charttime']).dropna(subset=dataset_labs.columns[4:], how='all')
dataset_labs['charttime'] = pd.to_datetime(dataset_labs['charttime'])
dataset_labs = dataset_labs.sort_values(by=['icustay_id', 'charttime'])
dataset_labs.drop(['albumin_min', 'albumin_max','bilirubin_min', 'bilirubin_max','bands_min', 'bands_max',
                   'lactate_min', 'lactate_max','platelet_min', 'platelet_max','ptt_min', 'ptt_max', 
                   'inr_min', 'inr_max', 'pt_min', 'pt_max'], axis = 1, inplace = True)
# Calculate mean for each pair and drop original columns
column_pairs = [('aniongap_min', 'aniongap_max'), ('albumin_min', 'albumin_max'), 
                ('bands_min', 'bands_max'), ('bicarbonate_min', 'bicarbonate_max'), 
                ('bilirubin_min', 'bilirubin_max'), ('creatinine_min', 'creatinine_max'), 
                ('chloride_min', 'chloride_max'), ('glucose_min', 'glucose_max'), 
                ('hematocrit_min', 'hematocrit_max'), ('hemoglobin_min', 'hemoglobin_max'), 
                ('lactate_min', 'lactate_max'), ('platelet_min', 'platelet_max'), 
                ('potassium_min', 'potassium_max'), ('ptt_min', 'ptt_max'), 
                ('inr_min', 'inr_max'), ('pt_min', 'pt_max'), ('sodium_min', 'sodium_max'), 
                ('bun_min', 'bun_max'), ('wbc_min', 'wbc_max')]

for min_col, max_col in column_pairs:
    try:
        mean_col = min_col.rsplit('_', 1)[0] + '_mean'
        dataset_labs[mean_col] = dataset_labs[[min_col, max_col]].mean(axis=1)
        dataset_labs.drop([min_col, max_col], axis=1, inplace=True)
    except:
        pass

dataset_vitals = pd.read_csv(DATA_PATH_vitals, sep=SEPARATOR)
dataset_vents = pd.read_csv(DATA_PATH_vents, sep=SEPARATOR)
dataset_vitals.drop(["heartrate_min", "heartrate_max", "sysbp_min", "sysbp_max", "diasbp_min", "diasbp_max",
                        'meanbp_min', 'meanbp_max', 'tempc_min', 'tempc_max', "resprate_min", "resprate_max", 
                        "spo2_min", "spo2_max", "glucose_min", "glucose_max"], axis=1, inplace=True)
dataset_vitals['charttime'] = pd.to_datetime(dataset_vitals['charttime'])
dataset_vents['charttime'] = pd.to_datetime(dataset_vents['charttime'])
dataset_vitals = dataset_vitals.dropna(subset=dataset_vitals.columns[4:], how='all')
dataset_vitals = dataset_vitals.sort_values(by=['icustay_id', 'charttime'])
dataset_vents = dataset_vents.sort_values(by=['icustay_id', 'charttime'])

# Merge datasets
if MAX_FEATURE_SET:
    
    # Perform merge operations and then drop the 'subject_id' column
    X_original = X.merge(dataset_labs, on=["icustay_id", "charttime"], how="outer") \
                   .merge(dataset_vitals, on=["icustay_id", "charttime", "subject_id", "hadm_id"], how="outer") \
                   .merge(dataset_vents, on=["icustay_id", "charttime"], how="outer") \
    X_original.drop(["subject_id"], axis=1, inplace=True)
    
    
print("Filtering patients by age and length of stay...")
dataset_detail = dataset_detail[dataset_detail['admission_age'] >= ADULTS_MIN_AGE]
adults_icustay_id_list = dataset_detail['icustay_id'].unique()
X = X[X.icustay_id.isin(adults_icustay_id_list)].sort_values(by=['icustay_id', 'charttime'])
X_original = X_original[X_original.icustay_id.isin(adults_icustay_id_list)].sort_values(by=['icustay_id', 'charttime'])

X_original = filter_by_length_of_stay(X_original)
dataset_detail = dataset_detail[dataset_detail.icustay_id.isin(X['icustay_id'].unique())].sort_values(by=['icustay_id'])

label = ['aki_stage']
skip = ['icustay_id', 'charttime', 'aki_stage']
discrete_feat = ['sedative', 'vasopressor', 'vent', 'hadm_id']
skip.extend(discrete_feat)    
numeric_feat = list(X_original.columns.difference(skip))

SAMPLING_INTERVALS = ['1H', '2H', '4H', '6H', '8H', '12H', '24H']

# saving every sampling interval
original = False
# Resampling
for SAMPLING_INTERVAL in SAMPLING_INTERVALS:
    if TIME_SAMPLING:
        
        # Set index and group by 'icustay_id' before resampling
        X_resampled = X_original.copy()
        X_resampled.set_index('charttime').groupby('icustay_id').resample(SAMPLING_INTERVAL)
        
        # Resample and aggregate features
        if MAX_FEATURE_SET:
            X_discrete = X_resampled[discrete_feat].max().fillna(FILL_VALUE).astype(np.int64)
        X_numeric = X_resampled[numeric_feat].mean()
        X_label = X_resampled['aki_stage'].max()

        print("Merging sampled features")
        try:
            X_resampled = pd.concat([X_numeric, X_discrete, X_label], axis=1).reset_index()
        except:
            X_resampled = pd.concat([X_numeric, X_label], axis=1).reset_index()

    # Forward fill again after resampling
    X_resampled['aki_stage'] = X_resampled.groupby('icustay_id')['aki_stage'].ffill(limit=RESAMPLE_LIMIT).fillna(0)
    print('X Columns', len(X_resampled.columns))

    # Ensure binary values (convert any positive number to 1)
    X_resampled['aki_stage'] = (X_resampled['aki_stage'] > 0).astype(int)

    # Shifting labels
    shift_steps = HOURS_AHEAD // int(SAMPLING_INTERVAL[:-1])
    X_resampled['aki_stage'] = X_resampled.groupby('icustay_id')['aki_stage'].shift(-shift_steps)
    X_resampled = X_resampled.dropna(subset=['aki_stage'])
    print('X Columns', len(X_resampled.columns))
    
    # Merging not time-dependent data
    dataset_detail_merging = dataset_detail[dataset_detail['icustay_id'].isin(X['icustay_id'].unique())].sort_values(by=['icustay_id'])
    if original:
        # theirs
        dataset_detail_merging = pd.get_dummies(dataset_detail_merging, columns=['gender', 'ethnicity_grouped'])
    else:
        dataset_detail_merging = pd.get_dummies(dataset_detail_merging, columns=['gender'])

    X_resampled = X_resampled.merge(dataset_detail_merging, on='icustay_id')
    print('X Columns', len(X_resampled.columns))


    # If no imputation method selected or only impute each id, for the remaining nan impute direclty with FILL_VALUE
    X_resampled = X_resampled.fillna(FILL_VALUE) 


    # Save preprocessed data
    X_resampled.to_csv(f'data/preprocessed/preprocessed_original_{SAMPLING_INTERVAL}.csv', index=False)
    print('X Columns', len(X_resampled.columns))


