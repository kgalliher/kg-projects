
/*
Ken Galliher - 08/12/15
Compare the SDE layers table min/max x/y to a feature class' bounding box.
Good for understanding extent display issues.
*/
SELECT 
  min(((SHAPE.STEnvelope()).STPointN(1)).STX) AS MINX,
  min(((SHAPE.STEnvelope()).STPointN(1)).STY) AS MINY,
  max(((SHAPE.STEnvelope()).STPointN(3)).STX) AS MAXX,
  max(((SHAPE.STEnvelope()).STPointN(3)).STY) AS MAXY
FROM SDE_LOAD.parcel

SELECT
  geometry::EnvelopeAggregate(shape).STBuffer(1).STPointN(1).STX AS MinX,
  geometry::EnvelopeAggregate(shape).STPointN(1).STX AS MinX,
  geometry::EnvelopeAggregate(shape).STPointN(1).STY AS MinY,
  geometry::EnvelopeAggregate(shape).STPointN(3).STX AS MaxX,
  geometry::EnvelopeAggregate(shape).STPointN(3).STY AS MaxX
FROM SDE_LOAD.parcel

