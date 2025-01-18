import pandas as pd
import json

def geojson_to_df(geojson):
    """Converts a GeoJSON file to a pandas DataFrame.

    Parameters
    ----------
    geojson : dict
        A GeoJSON dictionary.

    Returns
    -------
    pd.DataFrame
        A pandas DataFrame with the GeoJSON features.
    """
    features = geojson['features']
    df = pd.json_normalize(features)
    return df

def main():
    # load all geojson files in the data folder
    with open('data/geojson/aba_alert.geojson') as f:
        aba_geojson = json.load(f)
    with open('data/geojson/life_needs_alert.geojson') as f:
        life_needs_geojson = json.load(f)
    with open('data/geojson/year_needs_alert.geojson') as f:
        year_needs_geojson = json.load(f)
    
    # convert geojson to pandas DataFrame
    aba_df = geojson_to_df(aba_geojson)
    life_needs_df = geojson_to_df(life_needs_geojson)
    year_needs_df = geojson_to_df(year_needs_geojson)
    
    # TODO split the species column into separate columns
    
    