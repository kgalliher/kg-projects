# FabricESM

`FabricESM` is a TypeScript application that provides a user interface to select parcels in a parcel fabric, run the Merge function from the parcelfabricserver REST endpoint, and update specific attributes of the new parcel.

## Installation

Before installing the project, make sure you have installed Node.js and npm on your machine.

To install the project, follow these steps:

1. Clone the repository to your local machine using Git:

```
git clone https://github.com/kgalliher/kg-projects.git
```

2. Navigate to the `kg-javascript/FabricESM` directory:

```
cd kg-projects/kg-javascript/FabricESM
```

3. Install the dependencies:

```
npm install
```

## Usage

To start the application, run the following command:

```
npm start
```

This will start a development server and open the application in your default web browser.

The user interface allows you to create a new record, select parcels from the parcel fabric and specify the attributes for the new parcel that will result from merging the selected parcels. Once you have selected the parcels and specified the attributes, click the "Merge" button. This willsend a request to the `ParcelFabricServer` REST endpoint.

If the merge is successful, the application will display a message indicating that the new parcel has been created and updated with the specified attributes.

## Configuration

The `config.ts` file in the `src` directory contains the configuration settings for the application. You can modify these settings to customize the behavior of the application.
