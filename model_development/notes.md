changes:
    - extract more data
        - height
        - weight 
        - alices list
    - drop less data
        - bilirubin

- check if bilirubin and platelet count in columns

29.06

- train lstm on different data variants on alpha
- run feature importances for the trees
    from sklearn.ensemble import RandomForestClassifier
    import pandas as pd

    # Train a random forest model
    model = RandomForestClassifier(random_state=42)
    model.fit(X_train, y_train)

    # Extract feature importances
    feature_importances = model.feature_importances_
    importance_df = pd.DataFrame({'feature': X_train.columns, 'importance': feature_importances})
    importance_df = importance_df.sort_values(by='importance', ascending=False)
    print(importance_df)
