- download data from: https://caruscloud.uniklinikum-dresden.de/index.php/s/NHj22JJNcFkteTB  PW: 67qy4ceEDe
- put into data/ folder
- create virtual environment (virtualenv venv)
- activate venv
- pip install -r requirements.txt

- run data_preprocessing.ipynb (creates "data/data/preprocessed_data_full.csv")
- run training.ipynb (which loads "data/data/preprocessed_data_full.csv")