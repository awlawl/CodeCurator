
using SolrNet.Attributes;

namespace CodeIndex
{
    public class CodeDocument 
    {
        [SolrUniqueKey("id")] 
        public string ID { get; set; }

        [SolrField("filedata")] 
        public string FileData { get; set; }

        [SolrField("fullpath")] 
        public string FullPath { get; set; }

        [SolrField("name")] 
        public string Name { get; set; }

        [SolrField("project")] 
        public string Project { get; set; }

        [SolrField("category")]
        public string Category { get; set; }

    }
}
