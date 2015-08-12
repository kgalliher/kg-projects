/*
	Ken Galliher - 08/12/15
	Calculate the spatial index grids for a feature class.
	This creates a spatial table that can be overlayed onto the feature class ArcGIS.
	The IntersectionCount shows the density of intersecting features in each cell.
	Alter the @res (resolution) variable to get different grids at different decomp rates.
*/
IF OBJECT_ID (N'sde_load.parcel_cellbounds_hist', N'U') IS NOT NULL
DROP TABLE sde_load.parcel_cellbounds_hist;
GO
CREATE TABLE sde_load.parcel_cellbounds_hist(id int IDENTITY(1,1) PRIMARY KEY, Cellid int, cellbound geometry, IntersectionCount int);
GO

DECLARE @hist_results table
(
	CellId int,
	Cell geometry,
	IntersectionCount int
);

-- Calculate the min/max x/y from the shape column of a feature class or spatial table.
-- Update the EnvelopeAggregate() function with the name of your geometry column
DECLARE @minx float = (SELECT geometry::EnvelopeAggregate(shape).STPointN(1).STX  AS MinX FROM SDE_LOAD.PARCEL);
DECLARE @miny float = (SELECT geometry::EnvelopeAggregate(shape).STPointN(1).STY  AS MinY FROM SDE_LOAD.PARCEL);
DECLARE @maxx float = (SELECT geometry::EnvelopeAggregate(shape).STPointN(3).STX  AS MaxX FROM SDE_LOAD.PARCEL);
DECLARE @maxy float = (SELECT geometry::EnvelopeAggregate(shape).STPointN(3).STY  AS MaxY FROM SDE_LOAD.PARCEL);
DECLARE @res int = 64;

INSERT INTO @hist_results
EXEC
-- Built in stored procedure http://msdn.microsoft.com/en-us/library/gg509094.aspx
sp_help_spatial_geometry_histogram
	@tabname = 'SDE_LOAD.PARCEL', -- use single quotes if this should be qualified with a schema name
	@colname = shape,
	@xmin = @minx,
	@xmax = @maxx,
	@ymin = @miny,
	@ymax = @maxy,
	@resolution = @res

-- Insert the records from the calculated @hist_results table into the cellbounds table.
INSERT INTO sde_load.parcel_cellbounds_hist
SELECT CellID, CELL, /*.STBoundary().STBuffer(0.05) AS cellbound,*/ IntersectionCount
FROM @hist_results
GO

SELECT * FROM sde_load.parcel_cellbounds_hist