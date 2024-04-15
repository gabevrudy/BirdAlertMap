//Function to get Life Need Alerts, Year Need Alerts, and ABA Alerts from Email and save to Drive as geoJSON
//Trigger: Once a day

var ebird_dict = {

    "year_needs": {
      "query": 'subject:"[eBird Alert] Year Needs Alert for San Luis Obispo County <daily>" newer_than:1d',
      "file_prefix": 'year_needs_',
      "folder": "" // Specify your folder ID
    },
    "aba_alert": {
      "query": 'subject:"[eBird Alert] ABA Rarities <daily>" newer_than:1d',
      "file_prefix": 'aba_alert_',
      "folder": "" // Specify your folder ID
    },
      "life_needs": {
      "query": 'subject:"[eBird Alert] Needs Alert for San Luis Obispo County <daily>" newer_than:1d',
      "file_prefix": 'life_needs_',
      "folder": "" // Specify your folder ID
    }
  }
  
  function processAllEbirdAlerts() {
    for (var key in ebird_dict) {
      var alertInfo = ebird_dict[key];
      Logger.log("Processing " + key);
      extractEmailBodyAsJson(alertInfo.query, alertInfo.folder, alertInfo.file_prefix);
    }
  }
  
  function extractEmailBodyAsJson(query, folder, file_prefix) {
    var threads = GmailApp.search(query);
  
    if (threads.length > 0) {
      var message = threads[0].getMessages()[0];
      var email_body = message.getPlainBody();
      var email_date = message.getDate();
      var email_sent_by = message.getFrom();
  
      if (email_sent_by === 'ebird-alert@birds.cornell.edu') {
        var email_body_parsed = parseNeedAlertEmailBody(email_body);
        var geojson = convertToGeoJSON(email_body_parsed);
        var jsonString = JSON.stringify(geojson, null, 2);
        Logger.log(jsonString);
        Logger.log("Saving GeoJSON to Google Drive");
        saveJsonToDrive(jsonString, email_date, folder, file_prefix);
      }
    } else {
      Logger.log("No emails found matching the criteria for " + query);
    }
  }
  
  function saveJsonToDrive(jsonString, email_date, folder, file_prefix) {
    var formattedDate = email_date.toISOString().slice(0, 10); // This will give you "YYYY-MM-DD"
    var fileName = file_prefix + formattedDate + ".geojson";
    var folder = DriveApp.getFolderById(folder);
    var file = folder.createFile(fileName, jsonString, MimeType.PLAIN_TEXT);
    
    Logger.log("File created with ID: " + file.getId());
  }
  
  function parseNeedAlertEmailBody(email_body) {
    var detailedBirdReports = [];
    // This regex assumes the structure is consistent
    var reportRegex = /\r\n\r\n(.+?)\r\n- Reported (.+?) by (.+?)\r\n- (.+?)\r\n- Map: (.+?)\r\n- Checklist: (.+?)\r\n/g;
    
    var match;
    while ((match = reportRegex.exec(email_body)) !== null) {
      // Extracted details from the regex groups
      var coordinatesObject = extractCoordinatesFromMapUrl(match[5])
      var reportDetails = {
        species: match[1],
        reported: match[2],
        reporter: match[3],
        location: match[4],
        map_url: match[5],
        checklist: match[6],
        coordinates: extractCoordinatesFromMapUrl(match[5]),
        latitude: coordinatesObject.latitude,
        longitude: coordinatesObject.longitude 
      };
      // Add the extracted details to the array of reports
      detailedBirdReports.push(reportDetails);
    }
    return detailedBirdReports;
  
  }
  
  function extractCoordinatesFromMapUrl(map_url) {
    // Find the last '=' in the map_url and extract the substring after it
    var splitIndex = map_url.lastIndexOf('=');
    var coordinatesString = map_url.substring(splitIndex + 1);
    // Split the coordinatesString into latitude and longitude
    var coordinatesArray = coordinatesString.split(',');
    return {
      latitude: coordinatesArray[0],
      longitude: coordinatesArray[1]
    };
  }
  
  function convertToGeoJSON(detailedBirdReports) {
    var geojson = {
      "type": "FeatureCollection",
      "features": detailedBirdReports.map(function(report) {
        return {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [parseFloat(report.longitude), parseFloat(report.latitude)]
          },
          "properties": {
            "species": report.species,
            "reported": report.reported,
            "reporter": report.reporter,
            "location": report.location,
            "map_url": report.map_url,
            "checklist": report.checklist
          }
        };
      })
    };
    return geojson;
  }