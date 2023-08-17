## Chicago Top TIFs Web App
Chicago Top TIFs is a Google Earth Engine Web App designed to illuminate the finances of the City of Chicago. Please review "What Are These Variables?" before utilizing the [Chicago Top TIFs Web App](https://wtfineberg.users.earthengine.app/view/toptifs).

## What Are TIFs?
TIF stands for Tax Increment Financing. TIF Districts are designated by the municipality to capture property taxes for a fixed period of time. The captured property taxes are used to boost development in the designated TIF district. Read more about what TIFs are and how they work from The CivicLab:
- [TIF 101 Video](https://www.civiclab.us/tif-101/)
- [How Do TIFs Work?](https://www.civiclab.us/tif_illumination_project/how-do-tifs-work/)

## What Are These Variables?
Data for Chicago TIF Districts are released once per year. A yearly report for each TIF contains a variety 
Here are explanations for each data variable accessed in the [Chicago Top TIFs Web App](https://wtfineberg.users.earthengine.app/view/toptifs):
| Variable                               | Explanation                                 |
| -------------------------------------- | ------------------------------------------- |
| **TIF Lifespan**                       | The starting year through the proposed ending year. |
| **Current Data Year**                  | The year that the current data is from. |
| **Property Tax Extraction**            | The amount of property tax collected this year (within the TIF District). |
| **Cumulative Property Tax Extraction** | CUMULATIVE sum of property tax collected throughout the TIFs lifespan. |
| **Transfers In**                       | The amount transferred into this TIF District from neighboring TIF Districts this year. |
| **Cumulative Transfers In**            | CUMULATIVE sum of funds transferred into the TIF Fund from neighboring TIFs throughout the TIFs lifespan. |
| **Expenses**                           | The Total Expenditures. The amount of money spent on projects applicable to the TIF. |
| **Fund Balance End**                   | Balance of this TIF District's Fund at the end of the Current Data Year.    |
| **Transfers Out**                      | Amount of funds transferred out of the account and ported to a neighboring TIF District. |
| **Distribution**                       | Allocation and disbursement of funds.  |
| **Administration Costs**               | Amount taken by the City of Chicago for "City Staff Costs" and "City Program Management Costs". |
| **Finance Costs**                      | Amount provided to the TIF Fund by a banking institution. |
| **Bank Names**                         | Banks that provided the Finance Costs to the TIF Fund. |

Please refer to this table for a concise overview of the variables and their meanings.

## Where Is The Data From?
### Financial Data
The financial data was parsed from the City of Chicago's [TIF District Annual Report webpage](https://www.chicago.gov/city/en/depts/dcd/supp_info/tif-district-annual-reports-2004-present.html). Data from 2010-2022 inclusive was parsed from the PDFs using various Python libraries.
### Geospatial Data
Shapefiles for Chicago TIF District boundaries are sourced from the [Chicago Data Portal](https://data.cityofchicago.org/browse?q=tif+boundaries&sortBy=last_modified&tags=shapefiles&utf8=%E2%9C%93). The Red Line Extension (TIF# 186) is the only exception: this shape was entered in manually.
