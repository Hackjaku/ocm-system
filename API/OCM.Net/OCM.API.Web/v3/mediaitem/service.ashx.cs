﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OCM.API.V3.MediaItem
{
    /// <summary>
    /// Media Item API Endpoint Handler
    /// </summary>
    public class APIEndpoint : APICoreHTTPHandler
    {
        public APIEndpoint()
        {
            this.APIBehaviourVersion = 3;
            this.DefaultAction = "mediaitem";
            this.IsQueryByPost = false;
        }
    }
}