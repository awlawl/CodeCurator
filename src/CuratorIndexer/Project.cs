namespace CodeIndex
{
    public class Project
    {
        public string Category { get; set; }
        public string ProjectName { get; set; }
        public string Path { get; set; }
        public string[] IncludedPath { get; set; }
        public string[] ExcludedPath { get; set; }

        public Project()
        {
            //defaults to empty so if they are excluded from the xml they will still not be null
            IncludedPath= new string[0];
            ExcludedPath= new string[0];
        }
    }
}
