﻿using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Web;
using OCM.API.Common.Model;

namespace OCM.API.Common.DataSummary
{
    public class CountrySummary
    {
        public string CountryName { get; set; }
        public string ISOCode { get; set; }
        public int ItemCount { get; set; }
        public string ItemType { get; set; }
    }

    public class ActivitySummary {
        public List<UserComment> UserComments { get; set; }
        public List<ChargePoint> UpdatedChargePoints { get; set; }
        public List<ChargePoint> DelistedChargePoints { get; set; }
    }
  
    /// <summary>
    /// Provide basic summary counts/activity details on a per country basis or relative to specific filter parameters
    /// </summary>
    public class DataSummaryManager
    {
        public string GetTotalsPerCountrySummary(bool outputAsFunction, string functionName, SearchFilterSettings filterSettings)
        {
            //TODO: optionally output as normal JSON
            string output = "function " + functionName + "() { var ocm_summary = new Array(); \r\n";
            if (HttpContext.Current.Cache["ocm_summary"] == null)
            {
                List<CountrySummary> list = new List<CountrySummary>();

                var dataModel = new Core.Data.OCMEntities();
                var results = from c in dataModel.ChargePoints
                              where c.SubmissionStatusType.IsLive == true
                              group c by c.AddressInfo.Country into g
                              select new { g, NumItems = g.Count() };

                CultureInfo cultureInfo = Thread.CurrentThread.CurrentCulture;
                TextInfo textInfo = cultureInfo.TextInfo;

                foreach (var item in results)
                {
                    var c = item.g.First().AddressInfo.Country;
                    string countryName = textInfo.ToTitleCase(c.Title.ToLower());
                    string isoCode = c.ISOCode;
                    list.Add(new CountrySummary { CountryName = countryName, ISOCode = isoCode, ItemCount = item.g.Count(), ItemType="LocationsPerCountry" });
                }

                HttpContext.Current.Cache["ocm_summary"] = list.OrderByDescending(i => i.ItemCount).ToList();
            }
            var cachedresults = (List<CountrySummary>)HttpContext.Current.Cache["ocm_summary"];
            foreach (var item in cachedresults)
            {
                output += "ocm_summary[ocm_summary.length]={\"country\":\"" + item.CountryName + "\", \"isocode\":\"" + item.ISOCode + "\", \"itemcount\":" + item.ItemCount + "}; \r\n";
            }
            output += " return ocm_summary; }";
            return output;
        }

        public ActivitySummary GetActivitySummary(SearchFilterSettings filterSettings)
        {
            var dataModel = new Core.Data.OCMEntities();

            //default to last month
            DateTime dateFrom = DateTime.UtcNow.AddMonths(-1);

            if (filterSettings != null)
            {
                if (filterSettings.ChangesFromDate != null)
                {
                    dateFrom = filterSettings.ChangesFromDate.Value;
                }
                else
                {
                    filterSettings.ChangesFromDate = dateFrom;
                }
            }

            //populate recently added comments
            var recentComments =  from c in dataModel.UserComments
                                  where c.DateCreated>=dateFrom
                                  select c;

            ActivitySummary summary = new ActivitySummary();
            summary.UserComments = new List<UserComment>();
            foreach (var c in recentComments.OrderByDescending(c=>c.DateCreated))
            {
                summary.UserComments.Add(Model.Extensions.UserComment.FromDataModel(c));
            }

            //populate recently modified charge points TODO: differentiate between updated since and created since?
            ChargePointManager cpManager = new ChargePointManager();            
            summary.UpdatedChargePoints = cpManager.GetChargePoints(filterSettings);
            return summary; 
        }

    }
}