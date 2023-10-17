# Fabric Split-Build

`FabricESM` is a TypeScript application that provides a user interface to select parcels in a parcel fabric, run the `Merge` function or `CopyLinesTo` from the parcelfabricserver REST endpoint..

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
npm run dev
```

To build the app into a production environment:

```
npx vite build
```

This will start a development server and open the application in your default web browser.

The user interface allows you to create a new record, select parcels from the parcel fabric. Once you have selected the parcels and specified the attributes, click the "Merge" button or "Copy Lines to Parcel Type" . This will send a request to the `ParcelFabricServer` REST endpoint.

When copying a parcel into the parcel type, the polygon will shrink to a "seed" parcel. Use the edit widget to draw new boundaries within this boundary. When satisfied with the new line placement, click "Create Seeds: to generate new seeds inside the new boundaries. Click "Build" to build the seeds into full parcels.

If the function is successful, the application will display a message indicating that the new parcel(s) has been created.

## Configuration

The `config.ts` file in the `src` directory contains the configuration settings for the application. You can modify these settings to customize the behavior of the application.
