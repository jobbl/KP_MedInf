from datetime import datetime
import pandas as pd
import numpy as np
from sklearn.impute import SimpleImputer
from matplotlib import pyplot as plt
import seaborn as sns

# File paths and separator
DATA_PATH_stages = "data/extracted/kdigo_stages_measured.csv"
DATA_PATH_labs = "data/extracted/labs-kdigo_stages_measured.csv"
DATA_PATH_vitals = "data/extracted/vitals-kdigo_stages_measured.csv"
DATA_PATH_vents = "data/extracted/vents-vasopressor-sedatives-kdigo_stages_measured.csv"
DATA_PATH_detail = "data/extracted/icustay_detail-kdigo_stages_measured.csv"
DATA_PATH_heightweight = "data/extracted/heightweight-kdigo_stages_measured.csv"
DATA_PATH_calcium = "data/extracted/calcium-kdigo_stages_measured.csv"
DATA_PATH_inr_max = "data/extracted/inr_max-kdigo_stages_measured.csv"
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

# Minimal and maximal feature sets
min_set = ["icustay_id", "charttime", "creat", "uo_rt_6hr", "uo_rt_12hr", "uo_rt_24hr", "aki_stage"]
max_set = [
    'icustay_id', 'charttime', 'aki_stage', 'hadm_id', 'aniongap_avg', 'bicarbonate_avg',
    'bun_avg', 'chloride_avg', 'creat', 'diasbp_mean', 'glucose_avg', 'heartrate_mean',
    'hematocrit_avg', 'hemoglobin_avg', 'potassium_avg', 'resprate_mean', 'sodium_avg', 
    'spo2_mean', 'sysbp_mean', 'uo_rt_12hr', 'uo_rt_24hr', 'uo_rt_6hr', 'wbc_avg', 
    'sedative', 'vasopressor', 'vent', 'age', 'F', 'M', 'asian', 'black', 'hispanic', 
    'native', 'other', 'unknown', 'white', 'ELECTIVE', 'EMERGENCY', 'URGENT']

# Load datasets
print("Loading datasets...")
X = pd.read_csv(DATA_PATH_stages, sep=SEPARATOR)
X.drop(["aki_stage_creat", "aki_stage_uo"], axis=1, inplace=True)
X = X.dropna(how='all', subset=['creat', 'uo_rt_6hr', 'uo_rt_12hr', 'uo_rt_24hr', 'aki_stage'])
X['charttime'] = pd.to_datetime(X['charttime'])

dataset_detail = pd.read_csv(DATA_PATH_detail, sep=SEPARATOR)
dataset_detail.drop(['dod', 'admittime', 'dischtime', 'los_hospital', 'ethnicity', 
                     'hospital_expire_flag', 'hospstay_seq', 'first_hosp_stay', 'intime', 
                     'outtime', 'los_icu', 'icustay_seq', 'first_icu_stay'], axis=1, inplace=True)

dataset_labs = pd.read_csv(DATA_PATH_labs, sep=SEPARATOR)
dataset_labs = dataset_labs.dropna(subset=['charttime']).dropna(subset=dataset_labs.columns[4:], how='all')
dataset_labs['charttime'] = pd.to_datetime(dataset_labs['charttime'])
dataset_labs = dataset_labs.sort_values(by=['icustay_id', 'charttime'])

if MAX_FEATURE_SET:
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

dataset_heightweight = pd.read_csv(DATA_PATH_heightweight, sep=SEPARATOR)
dataset_heightweight = dataset_heightweight.dropna(subset=['icustay_id', 'height_first', 'weight_first'])
dataset_heightweight = dataset_heightweight.sort_values(by=['icustay_id'])

dataset_calcium = pd.read_csv(DATA_PATH_calcium, sep=SEPARATOR)
dataset_calcium.drop(["hadm_id"], axis=1, inplace=True)
dataset_calcium['charttime'] = pd.to_datetime(dataset_calcium['charttime'])
dataset_calcium = dataset_calcium.sort_values(by=['icustay_id', 'charttime'])

dataset_inr_max = pd.read_csv(DATA_PATH_inr_max, sep=SEPARATOR)
dataset_inr_max.drop(["hadm_id", "subject_id"], axis=1, inplace=True)
dataset_inr_max = dataset_inr_max.sort_values(by=['icustay_id'])

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
    mean_col = min_col.rsplit('_', 1)[0] + '_mean'
    dataset_labs[mean_col] = dataset_labs[[min_col, max_col]].mean(axis=1)
    dataset_labs.drop([min_col, max_col], axis=1, inplace=True)

# Merge datasets
if MAX_FEATURE_SET:
    X = X.merge(dataset_labs, on=["icustay_id", "charttime"], how="outer")
    X = X.merge(dataset_vitals, on=["icustay_id", "charttime", "subject_id", "hadm_id"], how="outer")
    X = X.merge(dataset_vents, on=["icustay_id", "charttime"], how="outer")
    X.drop(["subject_id"], axis=1, inplace=True)
    X = X.merge(dataset_calcium, on=["icustay_id", "charttime"], how="outer")

print("Filtering patients by age and length of stay...")
dataset_detail = dataset_detail[dataset_detail['admission_age'] >= ADULTS_MIN_AGE]
adults_icustay_id_list = dataset_detail['icustay_id'].unique()
X = X[X.icustay_id.isin(adults_icustay_id_list)].sort_values(by=['icustay_id', 'charttime'])


X = filter_by_length_of_stay(X)
dataset_detail = dataset_detail[dataset_detail.icustay_id.isin(X['icustay_id'].unique())].sort_values(by=['icustay_id'])

# Resampling
if TIME_SAMPLING:
    X = X.set_index('charttime').groupby('icustay_id').resample(SAMPLING_INTERVAL).mean()
    X = X.reset_index(drop=True)

X['aki_stage'] = X.groupby('icustay_id')['aki_stage'].fillna(method='ffill', limit=RESAMPLE_LIMIT).fillna(0)
X = X.fillna(FILL_VALUE)
X.loc[X['aki_stage'] > 1, 'aki_stage'] = 1

# Shifting labels
X['aki_stage'] = X.groupby('icustay_id')['aki_stage'].shift(-(HOURS_AHEAD // int(SAMPLING_INTERVAL[:-1])))
X = X.dropna(subset=['aki_stage'])

# Merging not time-dependent data
if MAX_FEATURE_SET:
    dataset_detail = dataset_detail[dataset_detail['icustay_id'].isin(X['icustay_id'].unique())].sort_values(by=['icustay_id'])
    dataset_detail = pd.get_dummies(dataset_detail, columns=['gender', 'ethnicity_grouped'])
    dataset_detail.drop(['subject_id', 'hadm_id'], axis=1, inplace=True)
    X = X.merge(dataset_detail, on='icustay_id')
    X = X.merge(dataset_heightweight, on='icustay_id')
    X = X.merge(dataset_inr_max, on='icustay_id')

# Save preprocessed data
X.to_csv('data/preprocessed_data_fuller.csv', index=False)