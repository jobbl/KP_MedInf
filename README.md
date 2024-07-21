https://tex.zih.tu-dresden.de/3372896927hmbrvqwgkqnt#2ab5b3

Publish via tunnel:
    - npm install -g localtunnel
    - lt --port 3000

Benutzer erstellen, einloggen, patienten hochladen, patienten sortieren, patienten löschen, patienten features hochladen, predicten

Kannst du in der Readme die Anleitung für den Prototypen und inlusive der Survey url machen (
https://bildungsportal.sachsen.de/umfragen/limesurvey/index.php/951387?lang=en) ?

# Evaluation des Prototyps "AKI Predictor"

Der AKI Predictor wurde im Rahmen des Komplexpraktikums "Medizinische Informatik" entwickelt, um medizinisches Personal auf der Intensivstation bei der Prognose von akutem Nierenversagen (AKI) zu unterstützen.

Es können folgende Funktionalitäten des Prototyps getestet werden: 
1. Erstellen eines neuen Benutzers
2. Einloggen mit den neuen Benutzerdaten
3. Hinzufügen von neuen Patienten in einer CSV-Datei: 
Dies kann mit der Test-Datei "patient_upload_test.csv" getestet werden. Sie beinhaltet die Daten einer neuen Patientin namens "Anna Wolf". 
4. Sortieren der Patiententabelle über die Pfeile in der Kopfzeile der Tabelle 
5. Suchen nach einzelnen Patientennamen 
6. Detailansicht eines Patienten über die jeweilige Zeile in der Tabelle
7. Hochladen von Laborwerten:
Achtung: Bitte **nur** für die neu hinzugefügte Patientin "Anna Wolf" Laborwerte hinzufügen!
Dies kann mit der Test-Datei "" getestet werden.
8. Starten einer neuen AKI-Prognose für einen Patienten
9. Löschen von Patienten aus der Patiententabelle
Achtung: Bitte **nur** die neu hinzugefügte Patientin "Anna Wolf" löschen!
10. Abmelden vom System