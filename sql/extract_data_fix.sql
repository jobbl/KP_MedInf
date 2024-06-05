-- -- original data extractions

-- -- extract icu stays with at least one measurement of creatinine or urine output into kdigo_stages_measured.csv
-- \copy (SELECT * FROM mimiciii.kdigo_stages WHERE icustay_id IN (SELECT icustay_id FROM mimiciii.kdigo_stages WHERE (creat IS NOT NULL OR uo_rt_6hr IS NOT NULL OR uo_rt_12hr IS NOT NULL OR uo_rt_24hr IS NOT NULL) AND aki_stage IS NOT NULL GROUP BY icustay_id HAVING COUNT(*) > 0)) TO 'data/extracted/kdigo_stages_measured.csv' WITH CSV HEADER DELIMITER ';';

-- -- extract demographics of patients with at least one measurement of creatinine or urine output into icustay_detail-kdigo_stages_measured.csv
-- \copy (SELECT * FROM mimiciii.icustay_detail WHERE icustay_id IN (SELECT icustay_id FROM mimiciii.kdigo_stages WHERE (creat IS NOT NULL OR uo_rt_6hr IS NOT NULL OR uo_rt_12hr IS NOT NULL OR uo_rt_24hr IS NOT NULL) AND aki_stage IS NOT NULL GROUP BY icustay_id HAVING COUNT(*) > 0)) TO 'data/extracted/icustay_detail-kdigo_stages_measured.csv' WITH CSV HEADER DELIMITER ';';

-- -- extract vitals of icu stays with at least one measurement of creatinine or urine output and an AKI label into vitals-kdigo_stages_measured.csv
-- \copy (SELECT * FROM mimiciii.vitals WHERE icustay_id IN (SELECT icustay_id FROM mimiciii.kdigo_stages WHERE (creat IS NOT NULL OR uo_rt_6hr IS NOT NULL OR uo_rt_12hr IS NOT NULL OR uo_rt_24hr IS NOT NULL) AND aki_stage IS NOT NULL GROUP BY icustay_id HAVING COUNT(*) > 0)) TO 'data/extracted/vitals-kdigo_stages_measured.csv' WITH CSV HEADER DELIMITER ';';

-- -- extract labs of icu stays with at least one measurement of creatinine or urine output and an AKI label into labs-kdigo_stages_measured.csv
-- \copy (SELECT * FROM mimiciii.labs WHERE icustay_id IN (SELECT icustay_id FROM mimiciii.kdigo_stages WHERE (creat IS NOT NULL OR uo_rt_6hr IS NOT NULL OR uo_rt_12hr IS NOT NULL OR uo_rt_24hr IS NOT NULL) AND aki_stage IS NOT NULL GROUP BY icustay_id HAVING COUNT(*) > 0)) TO 'data/extracted/labs-kdigo_stages_measured.csv' WITH CSV HEADER DELIMITER ';';

-- -- extract ventilations, vasopressor, and sedatives of icu stays with at least one measurement of creatinine or urine output and an AKI label into vents-vasopressor-sedatives-kdigo_stages_measured.csv 
-- \copy (SELECT ve.icustay_id AS icustay_id, ve.charttime AS charttime, vent, vasopressor, sedative FROM mimiciii.vent_kdigo_stages_labs_vitals_charttime ve, mimiciii.vasopressor_kdigo_stages_labs_vitals_charttime va, mimiciii.sedatives_kdigo_stages_labs_vitals_charttime s WHERE ve.icustay_id = va.icustay_id AND ve.charttime = va.charttime AND va.icustay_id = s.icustay_id AND va.charttime = s.charttime AND ve.icustay_id IN (SELECT icustay_id FROM mimiciii.kdigo_stages WHERE (creat IS NOT NULL OR uo_rt_6hr IS NOT NULL OR uo_rt_12hr IS NOT NULL OR uo_rt_24hr IS NOT NULL) AND aki_stage IS NOT NULL GROUP BY icustay_id HAVING COUNT(*) > 0) ORDER BY ve.icustay_id, ve.charttime) TO 'data/extracted/vents-vasopressor-sedatives-kdigo_stages_measured.csv' WITH CSV HEADER DELIMITER ';';

-- our data extractions

-- extract height and weight data
\copy (SELECT * FROM mimiciii.heightweight WHERE icustay_id IN (SELECT icustay_id FROM mimiciii.kdigo_stages WHERE (creat IS NOT NULL OR uo_rt_6hr IS NOT NULL OR uo_rt_12hr IS NOT NULL OR uo_rt_24hr IS NOT NULL) AND aki_stage IS NOT NULL GROUP BY icustay_id HAVING COUNT(*) > 0)) TO 'data/extracted/heightweight-kdigo_stages_measured.csv' WITH CSV HEADER DELIMITER ';';

-- extract calcium data from blood_gas_first_day
\copy (SELECT subject_id, hadm_id, icustay_id, charttime, calcium FROM mimiciii.blood_gas_first_day WHERE icustay_id IN (SELECT icustay_id FROM mimiciii.kdigo_stages WHERE (creat IS NOT NULL OR uo_rt_6hr IS NOT NULL OR uo_rt_12hr IS NOT NULL OR uo_rt_24hr IS NOT NULL) AND aki_stage IS NOT NULL GROUP BY icustay_id HAVING COUNT(*) > 0)) TO 'data/extracted/calcium-kdigo_stages_measured.csv' WITH CSV HEADER DELIMITER ';';

-- extract inr_max data from meld
\copy (SELECT subject_id, hadm_id, icustay_id, inr_max FROM mimiciii.meld WHERE icustay_id IN (SELECT icustay_id FROM mimiciii.kdigo_stages WHERE (creat IS NOT NULL OR uo_rt_6hr IS NOT NULL OR uo_rt_12hr IS NOT NULL OR uo_rt_24hr IS NOT NULL) AND aki_stage IS NOT NULL GROUP BY icustay_id HAVING COUNT(*) > 0)) TO 'data/extracted/inr_max-kdigo_stages_measured.csv' WITH CSV HEADER DELIMITER ';';