using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ESRI.ArcGIS.Geometry;

namespace GeodatabaseModel
{
    class Geometry
    {
        /// <summary>
        /// Create random points
        /// </summary>
        /// <returns></returns>
        public static IPointArray GeneratePoints()
        {
            IPointArray pts = new PointArrayClass();
            for (int i = 0; i < 100; i++)
            {
                IPoint pt = new PointClass();
                Random rndX = new Random();
                Random rndY = new Random();
                double ptx = rndX.Next(0, 90);
                double pty = rndY.Next(0, 180);
                pt.PutCoords(ptx, pty);
                pts.Add(pt);
            }

            return pts;
        }
    }
}
