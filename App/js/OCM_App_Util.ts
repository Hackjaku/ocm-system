/// <reference path="TypeScriptReferences/jquery/jquery.d.ts" />

/**
* @author Christopher Cook
* @copyright Webprofusion Ltd http://webprofusion.com
*/

module OCM {
    export class Utils {
        static getMaxLevelOfPOI(poi) {
            var level = 0;

            if (poi.Connections != null) {
                for (var c = 0; c < poi.Connections.length; c++) {
                    if (poi.Connections[c].Level != null && poi.Connections[c].Level.ID > level) {
                        level = poi.Connections[c].Level.ID;
                    }
                }
            }

            if (level == 4) level = 2; //lvl 1&2
            if (level > 4) level = 3; //lvl 2&3 etc
            return level;
        }

        static applyLocalisation(isTestMode: boolean) {
            try {
                if (isTestMode == true || localisation_dictionary != null) {
                    var elementList = $("[data-localize]");

                    for (var i = 0; i < elementList.length; i++) {
                        var $element = $(elementList[i]);
                        var resourceKey = $element.attr("data-localize");

                        if (isTestMode == true || eval("localisation_dictionary." + resourceKey) != undefined) {
                            var localisedText;

                            if (isTestMode == true) {
                                //in test mode the resource key is displayed as the localised text
                                localisedText = "[" + resourceKey + "] " + eval("localisation_dictionary." + resourceKey);
                            } else {
                                localisedText = eval("localisation_dictionary." + resourceKey);
                            }

                            if ($element.is("input")) {
                                if ($element.attr("type") == "button") {
                                    //set input button value
                                    $element.val(localisedText);
                                }
                            } else {
                                if ($element.attr("data-localize-opt") == "title") {
                                    //set title of element only
                                    $(elementList[i]).attr("title", localisedText);
                                } else {
                                    //standard localisation method is to replace inner text of element
                                    $(elementList[i]).text(localisedText);
                                }
                            }
                        }
                    }
                }
            } catch (exp) {
                //localisation attempt failed
            } finally {
            }
        }

        static fixJSONDate(val) {
            if (val == null) return null;
            if (val.indexOf("/") == 0) {
                var pattern = /Date\(([^)]+)\)/;
                var results = pattern.exec(val);
                val = new Date(parseFloat(results[1]));
            } else {
                val = new Date(val);
            }
            return val;
        }

        ///Begin Standard data formatting methods ///
        static formatMapLinkFromPosition(poi, searchLatitude, searchLongitude, distance, distanceunit) {
            return '<a href="http://maps.google.com/maps?saddr=' + searchLatitude + ',' + searchLongitude + '&daddr=' + poi.AddressInfo.Latitude + ',' + poi.AddressInfo.Longitude + '">Map (' + Math.ceil(distance) + ' ' + distanceunit + ')</a>';
        }

        static formatSystemWebLink(linkURL, linkTitle) {
            return "<a href='#' onclick=\"window.open('" + linkURL + "', '_system');return false;\">" + linkTitle + "</a>";
        }

        static formatMapLink(poi, linkContent, isRunningUnderCordova: boolean) {
            if (isRunningUnderCordova) {
                if (device && device.platform == "WinCE") {
                    return this.formatSystemWebLink("maps:" + poi.AddressInfo.Latitude + "," + poi.AddressInfo.Longitude, linkContent);
                    //return "<a target=\"_system\" data-role=\"button\" data-icon=\"grid\" href=\"maps:" + poi.AddressInfo.Latitude + "," + poi.AddressInfo.Longitude + "\">" + linkContent + "</a>";
                } else if (device && device.platform == "iOS") {
                    return this.formatSystemWebLink("http://maps.apple.com/?q=" + poi.AddressInfo.Latitude + "," + poi.AddressInfo.Longitude, linkContent);
                    //return "<a target=\"_system\" data-role=\"button\" data-icon=\"grid\" href=\"http://maps.apple.com/?q=" + poi.AddressInfo.Latitude + "," + poi.AddressInfo.Longitude + "\">" + linkContent + "</a>";
                } else {
                    return this.formatSystemWebLink("http://maps.google.com/maps?q=" + poi.AddressInfo.Latitude + "," + poi.AddressInfo.Longitude, linkContent);
                }
            }
            //default to google maps online link
            return "<a target=\"_blank\"  href=\"http://maps.google.com/maps?q=" + poi.AddressInfo.Latitude + "," + poi.AddressInfo.Longitude + "\">" + linkContent + "</a>";
        }

        static formatURL(url, title: string = null) {
            if (url == null || url == "") return "";
            if (url.indexOf("http") == -1) url = "http://" + url;
            return '<a target="_blank" href="' + url + '">' + (title != null ? title : url) + '</a>';
        }

        static formatPOIAddress = function (poi, includeLineBreaks: boolean = true) {
            var output = "";
            if (includeLineBreaks) {
                output = "" + this.formatTextField(poi.AddressInfo.AddressLine1) +
                this.formatTextField(poi.AddressInfo.AddressLine2) +
                this.formatTextField(poi.AddressInfo.Town) +
                this.formatTextField(poi.AddressInfo.StateOrProvince) +
                this.formatTextField(poi.AddressInfo.Postcode) +
                this.formatTextField(poi.AddressInfo.Country.Title);
            } else {
                output = this.formatStringArray([
                    poi.AddressInfo.AddressLine1,
                    poi.AddressInfo.AddressLine2,
                    poi.AddressInfo.Town,
                    poi.AddressInfo.StateOrProvince,
                    poi.AddressInfo.Postcode,
                    poi.AddressInfo.Country.Title
                ]);
            }
            return output;
        }

        static formatStringArray = function (list: Array<string>, separator: string = ", ") {
            if (list == null) return "";
            var output = "";
            for (var i = 0; i < list.length; i++) {
                if (list[i] != null && list[i].trim() != "") {
                    if (i == list.length - 1) {
                        output += list[i];
                    } else {
                        output += list[i] + separator;
                    }
                }
            }
            return output;
        }

        static formatString(val) {
            if (val == null) return "";
            return val.toString();
        }

        static formatTextField(val, label: string = null, newlineAfterLabel: boolean = false, paragraph: boolean = false, resourceKey: string = null) {
            if (val == null || val == "" || val == undefined) return "";
            var output = (label != null ? "<strong class='ocm-label' " + (resourceKey != null ? "data-localize='" + resourceKey + "' " : "") + ">" + label + "</strong>: " : "") + (newlineAfterLabel ? "<br/>" : "") + (val.toString().replace("\n", "<br/>")) + "<br/>";
            if (paragraph == true) output = "<p>" + output + "</p>";
            return output;
        }

        static formatEmailAddress(email: string) {
            if (email != undefined && email != null && email != "") {
                return "<i class='fa fa-envelope fa-fw'></i> <a href=\"mailto:" + email + "\">" + email + "</a><br/>";
            } else {
                return "";
            }
        }

        static formatPhone(phone, labeltitle: string = null) {
            if (phone != undefined && phone != null && phone != "") {
                if (labeltitle == null) {
                    labeltitle = "<i class='fa fa-phone fa-fw '></i> ";
                }
                else {
                    labeltitle += ": ";
                }

                return labeltitle + "<a href=\"tel:" + phone + "\">" + phone + "</a><br/>";
            } else {
                return "";
            }
        }

        static formatPOIDetails(poi, fullDetailsMode: boolean) {
            var dayInMilliseconds = 86400000;
            var currentDate = new Date();

            if (fullDetailsMode == null) fullDetailsMode = false;

            var addressInfo = this.formatPOIAddress(poi, false);

            var contactInfo = "";
            contactInfo += this.formatPhone(poi.AddressInfo.ContactTelephone1);
            contactInfo += this.formatPhone(poi.AddressInfo.ContactTelephone2);
            contactInfo += this.formatEmailAddress(poi.AddressInfo.ContactEmail);

            var drivingInfo = "";

            if (poi.AddressInfo.Distance != null) {
                var directionsUrl = "http://maps.google.com/maps?saddr=&daddr=" + poi.AddressInfo.Latitude + "," + poi.AddressInfo.Longitude;
                drivingInfo += "<strong id='addr_distance'><span data-localize='ocm.details.approxDistance'>Distance</span>: " + poi.AddressInfo.Distance.toFixed(1) + " " + (poi.AddressInfo.DistanceUnit == 2 ? "Miles" : "KM") + "</strong>";
            }
            drivingInfo += "<p><i class='fa fa-fw fa-road'></i>  " + this.formatSystemWebLink(directionsUrl, "Get Directions") + "<br/>";

            if (poi.AddressInfo.RelatedURL != null && poi.AddressInfo.RelatedURL != "") {
                var displayUrl = poi.AddressInfo.RelatedURL;
                //remove protocol from url
                displayUrl = displayUrl.replace(/.*?:\/\//g, "");
                //shorten url if over 40 characters
                if (displayUrl.length > 40) displayUrl = displayUrl.substr(0, 40) + "..";
                contactInfo += "<i class='fa fa-fw fa-external-link'></i>  " + this.formatSystemWebLink(poi.AddressInfo.RelatedURL, "<span data-localize='ocm.details.addressRelatedURL'>" + displayUrl + "</span>");
            }

            contactInfo += "</p>";

            var comments = this.formatTextField(poi.GeneralComments, "Comments", true, true, "ocm.details.generalComments") +
                this.formatTextField(poi.AddressInfo.AccessComments, "Access", true, true, "ocm.details.accessComments");

            var additionalInfo = "";

            if (poi.NumberOfPoints != null) {
                additionalInfo += this.formatTextField(poi.NumberOfPoints, "Number Of Points", false, false, "ocm.details.numberOfPoints");
            }

            if (poi.UsageType != null) {
                additionalInfo += this.formatTextField(poi.UsageType.Title, "Usage", false, false, "ocm.details.usageType");
            }

            if (poi.UsageCost != null) {
                additionalInfo += this.formatTextField(poi.UsageCost, "Usage Cost", false, false, "ocm.details.usageCost");
            }

            if (poi.OperatorInfo != null) {
                if (poi.OperatorInfo.ID != 1) { //skip unknown operators
                    additionalInfo += this.formatTextField(poi.OperatorInfo.Title, "Operator", false, false, "ocm.details.operatorTitle");
                    if (poi.OperatorInfo.WebsiteURL != null) {
                        advancedInfo += this.formatTextField(this.formatURL(poi.OperatorInfo.WebsiteURL), "Operator Website", true, false, "ocm.details.operatorWebsite");
                    }
                }
            }

            var equipmentInfo = "";

            if (poi.StatusType != null) {
                equipmentInfo += this.formatTextField(poi.StatusType.Title, "Status", false, false, "ocm.details.operationalStatus");
                if (poi.DateLastStatusUpdate != null) {
                    equipmentInfo += this.formatTextField(Math.round(((<any>currentDate - <any>this.fixJSONDate(poi.DateLastStatusUpdate)) / dayInMilliseconds)) + " days ago", "Last Updated", false, false, "ocm.details.lastUpdated");
                }
            }

            //output table of connection info
            if (poi.Connections != null) {
                if (poi.Connections.length > 0) {
                    equipmentInfo += "<table class='table table-st'>";
                    equipmentInfo += "<tr><th data-localize='ocm.details.equipment.connectionType'>Connection</th><th data-localize='ocm.details.equipment.powerLevel'>Power Level</th><th data-localize='ocm.details.operationalStatus'>Status</th></tr>";

                    for (var c = 0; c < poi.Connections.length; c++) {
                        var con = poi.Connections[c];
                        if (con.Amps == "") con.Amps = null;
                        if (con.Voltage == "") con.Voltage = null;
                        if (con.Quantity == "") con.Quantity = null;
                        if (con.PowerKW == "") con.PowerKW = null;

                        equipmentInfo += "<tr>" +
                        "<td>" + (con.ConnectionType != null ? con.ConnectionType.Title : "") + "</td>" +
                        "<td>" + (con.Level != null ? "<strong>" + con.Level.Title + "</strong><br/>" : "") +
                        (con.Amps != null ? this.formatString(con.Amps) + "A/ " : "") +
                        (con.Voltage != null ? this.formatString(con.Voltage) + "V/ " : "") +
                        (con.PowerKW != null ? this.formatString(con.PowerKW) + "kW <br/>" : "") +
                        (con.CurrentType != null ? con.CurrentType.Title : "") + "<br/>" +
                        (con.Quantity != null ? this.formatString(con.Quantity) : "1") + " Present" +
                        "</td>" +
                        "<td>" + (con.StatusType != null ? con.StatusType.Title : "-") + "</td>" +
                        "</tr>";
                    }
                    equipmentInfo += "</table>";
                }
            }

            var advancedInfo = "";
            advancedInfo += this.formatTextField("<a target='_blank' href='http://openchargemap.org/site/poi/details/" + poi.ID + "'>OCM-" + poi.ID + "</a>", "OpenChargeMap Ref", false, false, "ocm.details.refNumber");
            if (poi.DataProvider != null) {
                advancedInfo += this.formatTextField(poi.DataProvider.Title, "Data Provider", false, false, "ocm.details.dataProviderTitle");
                if (poi.DataProvider.WebsiteURL != null) {
                    advancedInfo += this.formatTextField(this.formatURL(poi.DataProvider.WebsiteURL), "Website", false, false, "ocm.details.dataProviderWebsite");
                }
                advancedInfo += this.formatTextField(poi.AddressInfo.Latitude, "Latitude", false, false, null);
                advancedInfo += this.formatTextField(poi.AddressInfo.Longitude, "Longitude", false, false, null);
            }

            var output = {
                "address": addressInfo,
                "drivingInfo": drivingInfo,
                "contactInfo": contactInfo,
                "additionalInfo": comments + additionalInfo + equipmentInfo,
                "advancedInfo": advancedInfo
            };
            return output;
        }
    }
}