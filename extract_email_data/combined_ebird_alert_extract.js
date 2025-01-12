//Function to get eBird Alerts from Email and save to Drive as JSON
//Trigger: Once a day

// Dictionary to store the queries and file names for different eBird alerts
var ebird_dict = {
  "year_needs": {
    "query": 'subject:"[eBird Alert] Year Needs Alert for San Luis Obispo County <daily>" newer_than:1d',
    "file_name": 'year_needs_alert',
    "file_id": "" // Add the file ID of the Google Drive file
  },
  "aba_alert": {
    "query": 'subject:"[eBird Alert] ABA Rarities <daily>" newer_than:1d',
    "file_name": 'aba_alert',
    "file_id": "" // Add the file ID of the Google Drive file
  },
    "life_needs": {
     "query": 'subject:"[eBird Alert] Needs Alert for San Luis Obispo County <daily>" newer_than:1d',
     "file_name": 'life_needs_alert',
     "file_id": "" // Add the file ID of the Google Drive file
  }
}

// Function to process all eBird alerts
function processAllEbirdAlerts() {
  for (var key in ebird_dict) {
    var alertInfo = ebird_dict[key];
    Logger.log("Processing " + key);
    extractEmailBodyAsJson(alertInfo.query, alertInfo.file_id, alertInfo.file_name);
  }
}

// main function to extract email body as JSON
function extractEmailBodyAsJson(query, file_id, file_name) {
  var threads = GmailApp.search(query);
  
  if (threads.length > 0) {
    // Assuming you're interested in the first email found
    var message = threads[0].getMessages()[0]; // Get the first message of the first thread
    var email_body = message.getPlainBody(); // Extract the plain text body
    var email_sent_by = message.getFrom();

    if (email_sent_by == 'ebird-alert@birds.cornell.edu') {
    
      var email_body_parsed = parseNeedAlertEmailBody(email_body);
      
      // Convert the parsed email body to GeoJSON
      var geojson = convertToGeoJSON(email_body_parsed);
      
      var jsonString = JSON.stringify(geojson, null, 2);
      Logger.log(jsonString);
      Logger.log("Saving GeoJSON to Google Drive");
      saveJsonToDrive(file_id, jsonString, file_name);
    }
  } else {
    Logger.log("No emails found matching the criteria.");
  }
}

// Function to save JSON to Google Drive
function saveJsonToDrive(file_id, jsonString, file_name) {
  try {
      var file = DriveApp.getFileById(file_id);
      file.setContent(jsonString); // Overwrite the existing content
      Logger.log("File content overwritten with ID: " + file.getId());
  } catch (e) {
      Logger.log("Error: " + e.toString());
  }
}
 
// Function to parse email body of Need Alert 
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

// Helper function to extract coordinates from the map_url and split into latitude and longitude
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

// Function to convert detailedBirdReports array to GeoJSON
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