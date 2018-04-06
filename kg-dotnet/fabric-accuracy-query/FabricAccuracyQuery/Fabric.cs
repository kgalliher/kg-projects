using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using ESRI.ArcGIS.Geodatabase;

namespace FabricAccuracyQuery
{
    class Fabric
    {
        public static List<string> QueryStandaloneTable(ITable table, string searchField)
        {
            List<string> output = new List<string>();

            try
            {
                ICursor cursor = table.Search(null, false);
                IRow row = cursor.NextRow();

                output.Add(string.Format("{0}", table.RowCount(null).ToString()));

                while (row != null)
                {
                    string desc = row.Value[cursor.FindField(searchField)].ToString();
                    if (desc.Length > 0)
                        output.Add(desc);
                    else
                        output.Add("nvdf");
                    row = cursor.NextRow();
                }
                return output;
            }
            catch (Exception ex)
            {
                MessageBox.Show("An error occured:\n" + ex.Message);
            }

            return null;
        }
    }
}
