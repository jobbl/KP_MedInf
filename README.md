https://tex.zih.tu-dresden.de/3372896927hmbrvqwgkqnt#2ab5b3

Publish via tunnel:
    - npm install -g localtunnel
    - lt --port 3000 --subdomain aki-tool
    - use pw from https://loca.lt/mytunnelpassword

Deploy in docker:
- docker-compose up in /web

Change for local deploy:
- change "proxy": "http://backend:8000" for "proxy": "http://localhost:8000" in web/aki-frontend/package.json


# Evaluation des Prototyps "AKI Predictor"

Der AKI Predictor wurde im Rahmen des Komplexpraktikums "Medizinische Informatik" entwickelt, um medizinisches Personal auf der Intensivstation bei der Prognose von akutem Nierenversagen (AKI) zu unterstützen.
Nach dem Testen des Prototyps kann dieser über den Link https://bildungsportal.sachsen.de/umfragen/limesurvey/index.php/951387?lang=en evaluiert werden.

Es können folgende Funktionalitäten des Prototyps getestet werden: 
### 1. Erstellen eines neuen Benutzers
### 2. Einloggen mit den neuen Benutzerdaten
### 3. Hinzufügen von neuen Patienten in einer CSV-Datei 
Dies kann mit der Test-Datei "patient_upload_test.csv" getestet werden. Sie beinhaltet die Daten einer neuen Patientin namens "Anna Wolf". 
### 4. Sortieren der Patiententabelle über die Pfeile in der Kopfzeile der Tabelle 
### 5. Suchen nach einzelnen Patientennamen 
### 6. Detailansicht eines Patienten über die jeweilige Zeile in der Tabelle
### 7. Hochladen von Laborwerten:
Achtung: Bitte **nur** für die neu hinzugefügte Patientin "Anna Wolf" Laborwerte hinzufügen!
Dies kann mit der Test-Datei "" getestet werden.
### 8. Starten einer neuen AKI-Prognose für einen Patienten
### 9. Löschen von Patienten aus der Patiententabelle
Achtung: Bitte **nur** die neu hinzugefügte Patientin "Anna Wolf" löschen!
### 10. Abmelden vom System
