//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace OCM.Core.Data
{
    using System;
    using System.Collections.Generic;
    
    public partial class CheckinStatusType
    {
        public CheckinStatusType()
        {
            this.UserComments = new HashSet<UserComment>();
        }
    
        public byte ID { get; set; }
        public string Title { get; set; }
        public Nullable<bool> IsPositive { get; set; }
        public bool IsAutomatedCheckin { get; set; }
    
        public virtual ICollection<UserComment> UserComments { get; set; }
    }
}
