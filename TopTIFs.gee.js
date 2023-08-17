/** *******************************************************************************************************
 *          
 *          Chicago Top TIFs Web App
 * 
 *          2023 Metropolitan Chicago Data-science Corps (MCDC) Project for The CivicLab
 * 
 *          https://www.civiclab.us/
 *          https://sites.northwestern.edu/mcdc/
 *
 *  *******************************************************************************************************/


/********************************  GLOBAL VARIABLES  ********************************/

// For Dynamic Visualization (referenced in update functions)
var selectedYear = 2022;
var selectedVariable = 'property_tax_extraction';
var selectedVariableTitleCase = 'Property Tax Extraction';
var filteredCsv = csvData;
var tifDistricts = tifDistricts_2022;
var clickedDistrict;
var clickedTIFNumber;
var coloredClicked;
var matchingRow = null;
var rowDictionary = {};

// Define Styling for Subheadings
var bigStyle = { textAlign: 'center', fontWeight: 'bold', fontSize: '18px', margin: '0 0 4px 0', padding: '0' }
var subStyle = { fontWeight: 'bold', fontSize: '14px', margin: '4px 0', color: 'black', border: '0px'};
var highlightSubStyle = { fontWeight: 'bold', fontSize: '14px', margin: '4px 4px 4px 4px', border: '2px solid #915a07'};
var labelStyle = { whiteSpace: 'pre-wrap', margin: '2px 0 1px 10px' };
// Define Styling for Map Layers (Shapes)
var topColor = '00ff00';
var btmColor = 'ff0000';
var selColor = '16d3f9';
var topHighlight = { color: topColor, fillColor: 'f2ef573a', width: 1.5, lineType: 'solid' };
var btmHighlight = { color: btmColor, fillColor: 'f2ef573a', width: 1.5, lineType: 'solid' };
var selHighlight = { color: selColor, fillColor: 'f5e16452', width: 3, lineType: 'solid' };
// #16f9e7 cyan (brighter than #16d3f9)
// #fffda0 orange/yellow (more mild than #f2ef57)


// For the onClick handler printing
var labelsByProperty;
var subheadingsByProperty;

// For onClick handler and for clickPanel creation (top-right UI)
var propertyOrder_toDisplay = [
  'tif_name', 'tif_lifespan', 'tif_year',
  'property_tax_extraction', 'cumulative_property_tax_extraction',
  'transfers_in', 'cumulative_transfers_in', 'expenses',
  'fund_balance_end', 'transfers_out', 'distribution',
  'admin_costs', 'finance_costs', 'bank'
];

// For the Select Variable UI
var variableSelectItemsDict = {
  'Property Tax Extraction': 'property_tax_extraction',
  'Cumulative Property Tax Extraction': 'cumulative_property_tax_extraction',
  'Transfers In': 'transfers_in',
  'Cumulative Transfers In': 'cumulative_transfers_in',
  'Expenses': 'expenses',
  'Fund Balance End': 'fund_balance_end',
  'Transfers Out': 'transfers_out',
  'Distribution': 'distribution',
  'Administration Costs': 'admin_costs',
  'Finance Costs': 'finance_costs'
};
// For the highlightVariable() function that bordered a var in the clickPanel (top-right UI) 
var variableSelectItems = [
  'property_tax_extraction', 'cumulative_property_tax_extraction',
  'transfers_in', 'cumulative_transfers_in', 'expenses',
  'fund_balance_end', 'transfers_out', 'distribution',
  'admin_costs', 'finance_costs'
];

// For Year Select UI
var yearDict = {
  "2010": 2010,
  "2011": 2011,
  "2012": 2012,
  "2013": 2013,
  "2014": 2014,
  "2015": 2015,
  "2016": 2016,
  "2017": 2017,
  "2018": 2018,
  "2019": 2019,
  "2020": 2020,
  "2021": 2021,
  "2022": 2022
};


/********************************  Setup Map and UI Root  ********************************/

var map = ui.Map();
// map.layers().reset([tifDistricts]);  // layers[0]
map.style().set('cursor', 'crosshair');
map.centerObject(chiCenter, 12);
ui.root.clear();
ui.root.widgets().add(map);

// Remove everything from Web App except for the Scale Bar
map.setControlVisibility({
  all: false,
  layerList: false, 
  zoomControl: false,
  scaleControl: true,
  mapTypeControl: false,
  fullscreenControl: false,
  drawingToolsControl: false
});


/********************************  Top-Left UI Elements (Selects)  ********************************/

// Select Year
var yearSelect = ui.Select({
  items: Object.keys(yearDict),//['2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', 2014 /* Add more years */],
  // placeholder: 'Select Year',
  value: "2022",
  onChange: function(value) {
    selectedYear = yearDict[value];
    updateYear(false);
  },
  style: {
    width: '60px',
    // maxWidth: '200px',
    margin: '2px 2px 2px 10px'
  }
});

// Select Variable
var titleCaseKeys = Object.keys(variableSelectItemsDict);
var variableSelect = ui.Select({
  items: titleCaseKeys, //['property_tax_extraction', 'transfers_in', 'expenses', 'admin_costs' /* Add more variables */],
  // placeholder: 'Select Variable',
  value: titleCaseKeys[0],
  onChange: function(value) {
    selectedVariable = variableSelectItemsDict[value];
    selectedVariableTitleCase = value;
    highlightVariable();
    updateFives(false);
  },
  style: {
    width: '150px',
    // maxWidth: '200px',
    margin: '2px 2px 2px 10px'
  }
});

// Build a Widget Panel to hold Selects; add it to UI
var selectPanel = ui.Panel({
  widgets: [
    ui.Label("Modify Map", { textAlign: 'center', fontWeight: 'bold', fontSize: '18px', margin: '0 0 5px 35px'}),
    // ui.Label("M", labelStyle),
    ui.Label('Select a Variable: ', subStyle),
    variableSelect,
    ui.Label('Select a Year: ', subStyle), 
    yearSelect,
  ],
  style: { 
    position: 'top-left', 
    padding: '8px',
    width: '186px',
    // maxWidth: '200px'
  }
});
map.add(selectPanel);


/********************************  Top-Right UI Elements (Data Labels)  ********************************/

// Build a Panel to hold data for the clicked district
var clickPanel = ui.Panel({
  style: { position: 'top-right', padding: '8px', width: '240px' }
});
map.add(clickPanel);

// Add Desired Data Labels to clickPanel and dataLabels
var dataLabels = [];
var subheadingLabels = [];

var tifNameSub = ui.Label({ value: "TIF Name & Number", style: subStyle });
subheadingLabels.push(tifNameSub);
var tifName = ui.Label({ style: labelStyle });
dataLabels.push(tifName);

var tifLifespanSub = ui.Label({ value: "TIF Lifespan", style: subStyle });
subheadingLabels.push(tifLifespanSub);
var tifLifespan = ui.Label({ style: labelStyle });//{ whiteSpace: 'pre-wrap', margin: '0px 0px 0px 0px' });
dataLabels.push(tifLifespan);

var curYearSub = ui.Label({ value: "Current Data Year", style: subStyle });
subheadingLabels.push(curYearSub);
var curYear = ui.Label({ style: labelStyle });
dataLabels.push(curYear);

var propertyTaxExtractionSub = ui.Label({ value: "Property Tax Extraction", style: subStyle })
subheadingLabels.push(propertyTaxExtractionSub);
var propertyTaxExtraction = ui.Label({ style: labelStyle });
dataLabels.push(propertyTaxExtraction);

var cumulativePropertyTaxExtractionSub = ui.Label({ value: "Cumulative Property Tax Extraction", style: subStyle })
subheadingLabels.push(cumulativePropertyTaxExtractionSub);
var cumulativePropertyTaxExtraction = ui.Label({ style: labelStyle });
dataLabels.push(cumulativePropertyTaxExtraction);

var transfersInSub = ui.Label({ value: "Transfers In", style: subStyle })
subheadingLabels.push(transfersInSub);
var transfersIn = ui.Label({ style: labelStyle });
dataLabels.push(transfersIn);

var cumulativeTransfersInSub = ui.Label({ value: "Cumulative Transfers In", style: subStyle });
subheadingLabels.push(cumulativeTransfersInSub);
var cumulativeTransfersIn = ui.Label({ style: labelStyle });
dataLabels.push(cumulativeTransfersIn);

var expensesSub = ui.Label({ value: "Expenses", style: subStyle })
subheadingLabels.push(expensesSub);
var expenses = ui.Label({ style: labelStyle });
dataLabels.push(expenses);

////////////////
var fundBalanceEndSub = ui.Label({ value: "Fund Balance End", style: subStyle })
subheadingLabels.push(fundBalanceEndSub);
var fundBalanceEnd = ui.Label({ style: labelStyle });
dataLabels.push(fundBalanceEnd);

var transfersOutSub = ui.Label({ value: "Transfers Out", style: subStyle })
subheadingLabels.push(transfersOutSub);
var transfersOut = ui.Label({ style: labelStyle });
dataLabels.push(transfersOut);

var distributionSub = ui.Label({ value: "Distribution", style: subStyle })
subheadingLabels.push(distributionSub);
var distribution = ui.Label({ style: labelStyle });
dataLabels.push(distribution);

var adminCostsSub = ui.Label({ value: "Administration Costs", style: subStyle })
subheadingLabels.push(adminCostsSub);
var adminCosts = ui.Label({ style: labelStyle });
dataLabels.push(adminCosts);

var financeCostsSub = ui.Label({ value: "Finance Costs", style: subStyle })
subheadingLabels.push(financeCostsSub);
var financeCosts = ui.Label({ style: labelStyle });
dataLabels.push(financeCosts);

var bankSub = ui.Label({ value: "Bank Names (from Finance Costs)", style: subStyle })
subheadingLabels.push(bankSub);
var bank = ui.Label({ style: labelStyle });
dataLabels.push(bank);

// for (let i = 0; i < dataLabels.length; i++) {
//   clickPanel.add(dataLabels[i]);
// }

labelsByProperty = {};
subheadingsByProperty = {};
// Convert dataLabels structure into dictionary; used by clickEventHandler()
propertyOrder_toDisplay.forEach(function(variableName, index) {
  var curSubLabel = subheadingLabels[index];
  var curDataLabel = dataLabels[index];
  // Add Label and Subheading to UI
  clickPanel.add(curSubLabel);
  clickPanel.add(curDataLabel);
  // Add Labels and Subheadings to appropriate Dictionaries
  subheadingsByProperty[variableName] = curSubLabel;
  labelsByProperty[variableName] = curDataLabel;
});
 
/********************************  Legend - Bottom-Right UI  ********************************/

// set position of panel
var legend = ui.Panel({
  style: {
    position: 'bottom-right',
    padding: '8px 15px'
  }
});
// Create legend title
var legendTitle = ui.Label({
  value: 'Outline Legend',
  style: bigStyle,
});
// Add the title to the panel
legend.add(legendTitle);
// Creates and styles 1 row of the legend.
var makeRow = function(color, name) {
      // Create the label that is actually the colored box.
      var colorBox = ui.Label({
        style: {
          backgroundColor: '#' + color,
          // Use padding to give the box height and width.
          padding: '8px',
          margin: '0 0 4px 0'
        }
      });
      // Create the label filled with the description text.
      var description = ui.Label({
        value: name,
        style: {margin: '0 0 4px 6px'}
      });
      // return the panel
      return ui.Panel({
        widgets: [colorBox, description],
        layout: ui.Panel.Layout.Flow('horizontal')
      });
};
//  Palette with the colors
var palette =[topColor, btmColor, selColor];
// name of the legend
var names = ['Top 5 Values','Bottom 5 Values','Selected TIF'];
// Add color and and names
for (var i = 0; i < 3; i++) {
  legend.add(makeRow(palette[i], names[i]));
  }  
// add legend to map (alternatively you can also print the legend to the console)  
map.add(legend);  

 
/********************************  FUNCTION for Bottom-Left UI Element (Chart and Panel)  ********************************/

var chartPanel = ui.Panel({
  widgets: [],
  style: { 
    position: 'bottom-left', 
    // padding: '8px', 
    // maxHeight: '1000px', 
    // maxWidth: '1000px',
    // height: '400px',
    width: '500px',
  },
});
map.add(chartPanel);

function updateChart() {
  /**  Updates the bottom-left chart UI with current variables  */
  
  var chartData = csvData.filter(ee.Filter.eq('tif_number', clickedTIFNumber)).getInfo()['features'];
  print(chartData);
  // Initialize the data dictionary
  var yearToVariableDict = {};
  
  // Iterate through each feature in chartData
  chartData.forEach(function(feature) {
    var properties = feature['properties']; // Get the properties subobject
    var tifYear = properties['tif_year'];
    var curVal = properties[selectedVariable]; // Replace with the actual property name
    
    // Add the pairing to the dictionary
    yearToVariableDict[tifYear] = curVal;
  });
  
  // Convert the dictionary values to an array
  var data = [];
  for (var year in yearToVariableDict) {
    data.push(yearToVariableDict[year]);
  }
  
  // Create a GEE histogram chart from the data array
  var chart = ui.Chart.array.values(data, 0, Object.keys(yearToVariableDict))
    .setOptions({
      title: 'Chart of ' + selectedVariableTitleCase + ' for ' + rowDictionary['tif_name'],
      hAxis: { title: 'Value' },
      vAxis: { title: 'Year' },
      legend: { position: 'none' },
      // style: {
      //   // height: '300px',
      //   // width: '600px',
      //   // position: 'bottom'
      // },
    }).setChartType('BarChart');

  
  chartPanel.clear();
  chartPanel.style().set('shown', true);
  // chartPanel.style({
  //   shown: true,
  //   position: 'bottom-left', 
  //   // padding: '8px', 
  //   // maxHeight: '1000px', 
  //   // maxWidth: '1000px',
  //   // height: '400px',
  //   width: '800px',
  // })
  chartPanel.add(chart);
    
}

/********************************  FUNCTIONS to Filter Data Based on UI Input  ********************************/

function updateYear() {
  /**  Resets all map layers when Year Dropdown is altered  */
  
  print("updateYear()");
  
  // Clear Selection layer and DataPoint Labels
  wipeSelection();
  

  // tifDistricts = tifDistricts_2022.filter(ee.Filter.inList('tif_number', filteredCsv.aggregate_array('tif_number')))
  if (selectedYear <= 2014) {
    // 2010-2014
    tifDistricts = tifDistricts_2014pre.filter(ee.Filter.inList('tif_number', filteredCsv.aggregate_array('tif_number')))
  } else if (selectedYear >= 2015 && selectedYear <= 2016) {
    // 2015-2016
    tifDistricts = tifDistricts_2015and2016.filter(ee.Filter.inList('tif_number', filteredCsv.aggregate_array('tif_number')));
  } else if (selectedYear >= 2017 && selectedYear <= 2018) {
    // 2017-2018
    tifDistricts = tifDistricts_2017and2018.filter(ee.Filter.inList('tif_number', filteredCsv.aggregate_array('tif_number')));
  } else if (selectedYear >= 2019 && selectedYear <= 2021) {
    // 2019-2021
    tifDistricts = tifDistricts_2019thru2021.filter(ee.Filter.inList('tif_number', filteredCsv.aggregate_array('tif_number')));
  } else if (selectedYear >= 2022) {
    // 2022
    tifDistricts = tifDistricts_2022.filter(ee.Filter.inList('tif_number', filteredCsv.aggregate_array('tif_number')));
  }
  // IN FUTURE YEARS, ADD MORE SHAPEFILES HERE AS ANOTHER ELIF (or convert if/elif to a switch?)
  
  
  // Filter CSV and Shapefile for selected year; assign to global variables
  var tifNumsPresent = tifDistricts.aggregate_array('tif_number');
  filteredCsv = csvData.filter(ee.Filter.and(
    ee.Filter.eq('tif_year', selectedYear),
    ee.Filter.inList('tif_number', tifNumsPresent)
  ));
  
  // Add selected shapefile to map
  map.layers().set(0, tifDistricts); // map.layers().reset([tifDistricts]); 
  
  // Update top/bottom 5s
  updateFives();
  
}

function updateFives() {
  /**  Resets top/bottom 5s layers if either Year or Variable Dropdowns are altered  */
  
  print("updateFives()")
  
  // Instead of wiping selection, simply update chart if we have a selection active (layerLen >= 4)
  // wipeSelection()
  var layerLen = map.layers().length();
  if (layerLen >= 4) updateChart();
  
  // Obtain Top 5 and Bottom 5 (assumes UI selected a numerical variable)
  // var top5 = filteredCsv.sort(selectedVariable, false).limit(5);
  // var bottom5 = filteredCsv.sort(selectedVariable).limit(5);
  var top5 = filteredCsv.limit(5, selectedVariable, false);
  var bottom5 = filteredCsv.limit(5, selectedVariable);
  // Obtain the TIF Numbers for Top 5 and Bottom 5
  var topTIFNumbers = top5.aggregate_array('tif_number');
  var bottomTIFNumbers = bottom5.aggregate_array('tif_number');
  print("top5: ", topTIFNumbers);
  print("bottom5: ", bottomTIFNumbers);
  // Filter TIF districts shapefile by matching TIF numbers
  var topTIFs = tifDistricts.filter(ee.Filter.inList('tif_number', topTIFNumbers));
  var bottomTIFs = tifDistricts.filter(ee.Filter.inList('tif_number', bottomTIFNumbers));
  print(topTIFs, bottomTIFs);
  // Color code top/bottom and add to map
  var coloredTop = topTIFs.style(topHighlight);
  var coloredBottom = bottomTIFs.style(btmHighlight);
  // Add layers to map
  map.layers().set(1, coloredTop);  // coloredTop
  map.layers().set(2, coloredBottom);  // coloredBottom

  
}

function wipeSelection() {
  /**  Wipes Selection from map; Wipes data from labels in the top-right UI panel  */
  chartPanel.clear();
  chartPanel.style().set('shown', false);
  var layerLen = map.layers().length();
  if (layerLen >= 4) {
    map.remove(map.layers().get(3)) 
    for (var i = 0; i < dataLabels.length; i++) {
      dataLabels[i].setValue('');
    }
  }
}

function highlightVariable() {
  /**  Reset all headings except for current selection back to subStyle; selection is styled with highlightSubStyle */
  variableSelectItems.forEach(function(key) {
    subheadingsByProperty[key].style().set( (key === selectedVariable) ? highlightSubStyle : subStyle );
  });
}

// First Run to Build Map
highlightVariable();
updateYear();



/********************************  On-Click Event Handler (handles selection layer and datapoint display)  ********************************/

function clickEventHandler(coords) {
  // // Record the start time
  // var startTime = new Date().getTime();
  
  // Get the clicked district feature
  var clickedPoint = ee.Geometry.Point(coords.lon, coords.lat);
  clickedDistrict = tifDistricts.filterBounds(clickedPoint);
  var size = clickedDistrict.size().getInfo();
  if (size <= 0) {
    // User clicked outside of a TIF Boundary; clear selection layer and datapoint labels (if they exist)
    print("IGNORING CLICK OUTSIDE OF BOUNDARY...")
    wipeSelection();
    dataLabels[0].setValue("ERROR, please click within a TIF District boundary. Try again.")
  } else {
    
    // User clicked within a valid TIF Boundary
    clickedDistrict = clickedDistrict.first();
    clickedTIFNumber = clickedDistrict.get('tif_number');
    print('Clicked TIF Number:', clickedTIFNumber);
    // Find the matching row in the CSV data
    matchingRow = filteredCsv.filter(ee.Filter.eq('tif_number', clickedTIFNumber));
    var matchingRowSize = matchingRow.size().getInfo();
    if (matchingRowSize <= 0) {
      // this is possibly unreachable? filtering that occurs in updateMap() may make it impossible for a user to select a data-less district
      print("IGNORING NULL REQUEST, no matching row found...") 
      dataLabels[0].setValue("ERROR, data not found for the selected TIF district...");
    } else {
      
      // Set top-right UI (clickPanel) subheading formatting
      // highlightVariable();
      
      ////////// Color code selected TIF and ADD TO MAP //////////
      coloredClicked = ee.FeatureCollection([clickedDistrict]).style(selHighlight);
      map.layers().set(3, coloredClicked);
      
      ////////// Add Data Points to UI //////////
      rowDictionary = matchingRow.first().getInfo()["properties"];
      print(rowDictionary);
      // Add each datapoint to the clickPanel
      var value;
      propertyOrder_toDisplay.forEach(function(key) {
        if (key === 'tif_lifespan') {
          // Handle lifespan manually (combine start and end year into a string)
          var startYear = rowDictionary['start_year'].toString();
          var endYear = rowDictionary['end_year'].toString();
          value = startYear + " to " + endYear;
        } else if (key === 'tif_name') {
          // Manually insert tif_number with name
          value = rowDictionary[key];
          value = value + " (#" + rowDictionary['tif_number'].toString() + ") ";
        } else if (key === 'tif_year') {
          // Manually handle tif_year to avoid the else block below adding a $
          value = rowDictionary[key];
        } else {
          // All other keys should match
          value = '$ ' + rowDictionary[key].toLocaleString();
          // if (typeof value === 'number') {
          //   value = '$ ' + value.toLocaleString(); // Add $ prefix and format with commas
          // }
        }
        labelsByProperty[key].setValue(value);
        // print(labelsByProperty[key]);
      });
      
      ///////////// Create Chart Visualization (bottom-left) /////////////
      updateChart();
      
    }
    
  }
  
  // // Calculate the elapsed time
  // var endTime = new Date().getTime();
  // var elapsedTime = endTime - startTime;

  // // Print the runtime to the GEE console
  // print('onClick Runtime:', elapsedTime + ' ms');
}

map.onClick(clickEventHandler);



////////////////////////////////// CHART STUFF ///////////////////////////////////
      // Build a ui.Chart for the selected TIF
      // var chartData = csvData.filter(ee.Filter.eq('tif_number', clickedTIFNumber)).getInfo()['features'];
      // print(chartData);
      // Extract x and y values from the chartData dictionary
      // var xValues = chartData['tif_year']; // Assuming 'tif_year' is a key in the dictionary
      // var yValues = chartData[selectedVariable]; // Assuming selectedVariable is a valid key
      // print(xValues, yValues);
      // Create the chart
      // var chart = ui.Chart.array.values(yValues, 0, xValues)
      //   .setChartType('LineChart')
      
      // chartPanel.add(chart);
