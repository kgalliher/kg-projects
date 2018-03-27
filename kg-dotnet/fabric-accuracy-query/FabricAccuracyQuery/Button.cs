using System;
using System.Collections.Generic;
using System.Text;
using System.IO;


namespace FabricAccuracyQuery
{
    public class Button : ESRI.ArcGIS.Desktop.AddIns.Button
    {
        public Button()
        {
        }

        protected override void OnClick()
        {
            TheDialog theDialog = new TheDialog();
            theDialog.ShowDialog();
        }

        protected override void OnUpdate()
        {
            Enabled = ArcCatalog.Application != null;
        }
    }
}
