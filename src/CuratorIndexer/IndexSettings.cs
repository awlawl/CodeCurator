using System.IO;
using System.Xml;
using System.Xml.Serialization;

namespace CodeIndex
{
    public class IndexSettings
    {
        public string SolrUrl { get; set; }
        public string[] DefaultIncludedPath { get; set; }
        public string[] DefaultExcludedPath { get; set; }
        public Project[] Projects { get; set; }

        public string Serialize()
        {
            XmlSerializer xs = new XmlSerializer(typeof(IndexSettings));
            System.Text.StringBuilder sb = new System.Text.StringBuilder();
            System.IO.StringWriter sw = new System.IO.StringWriter(sb);
            //get rid of the first xml line
            XmlWriter xw = XmlWriter.Create(sw, new XmlWriterSettings { OmitXmlDeclaration = true, Indent = true });

            XmlSerializerNamespaces ns = new XmlSerializerNamespaces();
            ns.Add("", ""); //gets rid of the xmlns:xsd crap

            xs.Serialize(xw, this, ns);

            xw.Close();
            sw.Close();

            return sb.ToString();

        }

        public static IndexSettings Deserialize(string xml)
        {

            var returnVal = new IndexSettings();
			XmlSerializer serial = new XmlSerializer(returnVal.GetType());
			StringReader reader = new StringReader(xml);
			returnVal = (IndexSettings) serial.Deserialize(reader);
					
			return returnVal;
		   
        }

        public static IndexSettings LoadSettings()
        {
            string runtimeFile = @"settings.xml";
            string devtimeFile = @"..\..\settings.xml";
            string correctFile = "";

            if (File.Exists(runtimeFile))
                correctFile = runtimeFile;
            else
                correctFile = devtimeFile;


            return IndexSettings.Deserialize(File.ReadAllText(correctFile));
        }
    }
}
