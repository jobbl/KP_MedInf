DROP MATERIALIZED VIEW IF EXISTS labsfirstday CASCADE;
CREATE MATERIALIZED VIEW labs AS
SELECT
  pvt.subject_id, pvt.hadm_id, pvt.icustay_id, pvt.charttime

  -- Existing lab values
  , min(CASE WHEN label = 'ANION GAP' THEN valuenum ELSE null END) as ANIONGAP_min
  , max(CASE WHEN label = 'ANION GAP' THEN valuenum ELSE null END) as ANIONGAP_max
  -- ... other existing lab values ...
  , min(CASE WHEN label = 'WBC' THEN valuenum ELSE null END) as WBC_min
  , max(CASE WHEN label = 'WBC' THEN valuenum ELSE null END) as WBC_max

  -- New lab values
  , min(CASE WHEN label = 'BILIRUBIN, TOTAL' THEN valuenum ELSE null END) as BILIRUBIN_TOTAL_min
  , max(CASE WHEN label = 'BILIRUBIN, TOTAL' THEN valuenum ELSE null END) as BILIRUBIN_TOTAL_max
  , min(CASE WHEN label = 'ESTIMATED GFR' THEN valuenum ELSE null END) as ESTIMATED_GFR_min
  , max(CASE WHEN label = 'ESTIMATED GFR' THEN valuenum ELSE null END) as ESTIMATED_GFR_max
  , min(CASE WHEN label = 'PHOSPHATE' THEN valuenum ELSE null END) as PHOSPHATE_min
  , max(CASE WHEN label = 'PHOSPHATE' THEN valuenum ELSE null END) as PHOSPHATE_max
  , min(CASE WHEN label = 'UREA NITROGEN' THEN valuenum ELSE null END) as UREA_NITROGEN_min
  , max(CASE WHEN label = 'UREA NITROGEN' THEN valuenum ELSE null END) as UREA_NITROGEN_max
  , min(CASE WHEN label = 'URIC ACID' THEN valuenum ELSE null END) as URIC_ACID_min
  , max(CASE WHEN label = 'URIC ACID' THEN valuenum ELSE null END) as URIC_ACID_max
  , min(CASE WHEN label = 'CALCIUM, TOTAL' THEN valuenum ELSE null END) as CALCIUM_TOTAL_min
  , max(CASE WHEN label = 'CALCIUM, TOTAL' THEN valuenum ELSE null END) as CALCIUM_TOTAL_max
  , min(CASE WHEN label = 'INR' THEN valuenum ELSE null END) as INR_PT_min
  , max(CASE WHEN label = 'INR' THEN valuenum ELSE null END) as INR_PT_max
  , min(CASE WHEN label = 'PLATELET COUNT' THEN valuenum ELSE null END) as PLATELET_COUNT_min
  , max(CASE WHEN label = 'PLATELET COUNT' THEN valuenum ELSE null END) as PLATELET_COUNT_max
  
FROM
( -- begin query that extracts the data
  SELECT ie.subject_id, ie.hadm_id, ie.icustay_id, charttime
  -- here we assign labels to ITEMIDs
  -- this also fuses together multiple ITEMIDs containing the same data
  , CASE
        WHEN itemid = 50868 THEN 'ANION GAP'
        WHEN itemid = 50862 THEN 'ALBUMIN'
        WHEN itemid = 51144 THEN 'BANDS'
        WHEN itemid = 50882 THEN 'BICARBONATE'
        WHEN itemid = 50885 THEN 'BILIRUBIN, TOTAL'
        WHEN itemid = 50912 THEN 'CREATININE'
        WHEN itemid = 50902 THEN 'CHLORIDE'
        WHEN itemid = 50806 THEN 'CHLORIDE'
        WHEN itemid = 50931 THEN 'GLUCOSE'
        WHEN itemid = 50809 THEN 'GLUCOSE'
        WHEN itemid = 50810 THEN 'HEMATOCRIT'
        WHEN itemid = 51221 THEN 'HEMATOCRIT'
        WHEN itemid = 50811 THEN 'HEMOGLOBIN'
        WHEN itemid = 51222 THEN 'HEMOGLOBIN'
        WHEN itemid = 50813 THEN 'LACTATE'
        WHEN itemid = 51265 THEN 'PLATELET COUNT'
        WHEN itemid = 50822 THEN 'POTASSIUM'
        WHEN itemid = 50971 THEN 'POTASSIUM'
        WHEN itemid = 51275 THEN 'PTT'
        WHEN itemid = 51237 THEN 'INR'
        WHEN itemid = 51274 THEN 'PT'
        WHEN itemid = 50824 THEN 'SODIUM'
        WHEN itemid = 50983 THEN 'SODIUM'
        WHEN itemid = 51006 THEN 'UREA NITROGEN'
        WHEN itemid = 51300 THEN 'WBC'
        WHEN itemid = 51301 THEN 'WBC'
        WHEN itemid = 50920 THEN 'ESTIMATED GFR'
        WHEN itemid = 50970 THEN 'PHOSPHATE'
        WHEN itemid = 51007 THEN 'URIC ACID'
        WHEN itemid = 50893 THEN 'CALCIUM, TOTAL'
      ELSE null
    END AS label
  , -- add in some sanity checks on the values
  -- the where clause below requires all valuenum to be > 0, so these are only upper limit checks
    CASE
      WHEN itemid = 50862 and valuenum >    10 THEN null -- g/dL 'ALBUMIN'
      WHEN itemid = 50868 and valuenum > 10000 THEN null -- mEq/L 'ANION GAP'
      WHEN itemid = 51144 and valuenum <     0 THEN null -- immature band forms, %
      WHEN itemid = 51144 and valuenum >   100 THEN null -- immature band forms, %
      WHEN itemid = 50882 and valuenum > 10000 THEN null -- mEq/L 'BICARBONATE'
      WHEN itemid = 50885 and valuenum >   150 THEN null -- mg/dL 'BILIRUBIN, TOTAL'
      WHEN itemid = 50806 and valuenum > 10000 THEN null -- mEq/L 'CHLORIDE'
      WHEN itemid = 50902 and valuenum > 10000 THEN null -- mEq/L 'CHLORIDE'
      WHEN itemid = 50912 and valuenum >   150 THEN null -- mg/dL 'CREATININE'
      WHEN itemid = 50809 and valuenum > 10000 THEN null -- mg/dL 'GLUCOSE'
      WHEN itemid = 50931 and valuenum > 10000 THEN null -- mg/dL 'GLUCOSE'
      WHEN itemid = 50810 and valuenum >   100 THEN null -- % 'HEMATOCRIT'
      WHEN itemid = 51221 and valuenum >   100 THEN null -- % 'HEMATOCRIT'
      WHEN itemid = 50811 and valuenum >    50 THEN null -- g/dL 'HEMOGLOBIN'
      WHEN itemid = 51222 and valuenum >    50 THEN null -- g/dL 'HEMOGLOBIN'
      WHEN itemid = 50813 and valuenum >    50 THEN null -- mmol/L 'LACTATE'
      WHEN itemid = 51265 and valuenum > 10000 THEN null -- K/uL 'PLATELET'
      WHEN itemid = 50822 and valuenum >    30 THEN null -- mEq/L 'POTASSIUM'
      WHEN itemid = 50971 and valuenum >    30 THEN null -- mEq/L 'POTASSIUM'
      WHEN itemid = 51275 and valuenum >   150 THEN null -- sec 'PTT'
      WHEN itemid = 51237 and valuenum >    50 THEN null -- 'INR'
      WHEN itemid = 51274 and valuenum >   150 THEN null -- sec 'PT'
      WHEN itemid = 50824 and valuenum >   200 THEN null -- mEq/L == mmol/L 'SODIUM'
      WHEN itemid = 50983 and valuenum >   200 THEN null -- mEq/L == mmol/L 'SODIUM'
      WHEN itemid = 51006 and valuenum >   300 THEN null -- 'BUN'
      WHEN itemid = 51300 and valuenum >  1000 THEN null -- 'WBC'
      WHEN itemid = 51301 and valuenum >  1000 THEN null -- 'WBC'

      -- new lab values
      WHEN itemid = 50920 and valuenum >   120 THEN null -- 'ESTIMATED GFR'
      WHEN itemid = 50970 and valuenum >  2000 THEN null -- 'PHOSPHATE'
      WHEN itemid = 51007 and valuenum >   150 THEN null -- 'URIC ACID'
      WHEN itemid = 50893 and valuenum >    20 THEN null -- 'CALCIUM, TOTAL'
      WHEN itemid = 50885 and valuenum >   150 THEN null -- 'BILIRUBIN, TOTAL'
      WHEN itemid = 51265 and valuenum > 10000 THEN null -- 'PLATELET COUNT'
    ELSE le.valuenum
    END AS valuenum

  FROM icustays ie

  LEFT JOIN labevents le
    ON le.subject_id = ie.subject_id AND le.hadm_id = ie.hadm_id
    AND le.ITEMID in
    (
      -- comment is: LABEL | CATEGORY | FLUID | NUMBER OF ROWS IN LABEVENTS
      50868, -- ANION GAP | CHEMISTRY | BLOOD | 769895
      50862, -- ALBUMIN | CHEMISTRY | BLOOD | 146697
      51144, -- BANDS - hematology
      50882, -- BICARBONATE | CHEMISTRY | BLOOD | 780733
      50885, -- BILIRUBIN, TOTAL | CHEMISTRY | BLOOD | 238277
      50912, -- CREATININE | CHEMISTRY | BLOOD | 797476
      50902, -- CHLORIDE | CHEMISTRY | BLOOD | 795568
      50806, -- CHLORIDE, WHOLE BLOOD | BLOOD GAS | BLOOD | 48187
      50931, -- GLUCOSE | CHEMISTRY | BLOOD | 748981
      50809, -- GLUCOSE | BLOOD GAS | BLOOD | 196734
      51221, -- HEMATOCRIT | HEMATOLOGY | BLOOD | 881846
      50810, -- HEMATOCRIT, CALCULATED | BLOOD GAS | BLOOD | 89715
      51222, -- HEMOGLOBIN | HEMATOLOGY | BLOOD | 752523
      50811, -- HEMOGLOBIN | BLOOD GAS | BLOOD | 89712
      50813, -- LACTATE | BLOOD GAS | BLOOD | 187124
      51265, -- PLATELET COUNT | HEMATOLOGY | BLOOD | 778444
      50971, -- POTASSIUM | CHEMISTRY | BLOOD | 845825
      50822, -- POTASSIUM, WHOLE BLOOD | BLOOD GAS | BLOOD | 192946
      51275, -- PTT | HEMATOLOGY | BLOOD | 474937
      51237, -- INR(PT) | HEMATOLOGY | BLOOD | 471183
      51274, -- PT | HEMATOLOGY | BLOOD | 469090
      50983, -- SODIUM | CHEMISTRY | BLOOD | 808489
      50824, -- SODIUM, WHOLE BLOOD | BLOOD GAS | BLOOD | 71503
      51006, -- UREA NITROGEN | CHEMISTRY | BLOOD | 791925
      51301, -- WHITE BLOOD CELLS | HEMATOLOGY | BLOOD | 753301
      51300, -- WBC COUNT | HEMATOLOGY | BLOOD | 2371
      50920, -- Estimated GFR (MDRD equation)
      50970, -- Phosphate
      51007, -- Uric Acid
      50893  -- Calcium, Total
    )
    AND valuenum IS NOT null AND valuenum > 0 -- lab values cannot be 0 and cannot be negative
) pvt
GROUP BY pvt.subject_id, pvt.hadm_id, pvt.icustay_id, charttime;