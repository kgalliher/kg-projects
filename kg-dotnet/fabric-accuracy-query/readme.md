## Parcel Fabric Accuracy Viewer

### Query the <fabric>_Accuracy table of a parcel fabric.

Two different customers were complaining their fabric accuracy tables were empty or malformed.  Both were using fabrics in a file geodatabase so simple querying of the table was not available as it would be in an enterprise geodatabase.

I put this simple AddIn together to query the system table to view what was happening.  Also helped prove to the customer that the table was indeed empty and the lack of dropdown options was not a UI issue.

### Good Accuracy Table:
![Alt text](images/good_accuracy.png?raw=true "Optional Title")

### Empty Accuracy Table:
![Alt text](images/empty_accuracy.png?raw=true "Optional Title")

