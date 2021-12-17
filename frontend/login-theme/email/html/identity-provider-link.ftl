<html>
<body style="background-color: #fcfcfc">
<header class="login-pf-header headlineBox signin"
        style="margin: 0; width: 100%; padding: 4rem 2rem 4rem 2rem; background: #204359; box-sizing: border-box;  ">
    <h1 style="color: white; text-align: center;"><svg class="logo" width="96px" height="96px" filter="drop-shadow(0 0 20px #707070)" viewBox="0 0 2796 2796" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;">
    <g transform="matrix(1,0,0,1,-355,-196)">
        <g id="V6_light" transform="matrix(1,0,0,1,513.78,0)">
            <g>
                <clipPath id="_clip1">
                    <path d="M1238.66,551.426C1812.1,550.597 2278.33,1015.07 2279.16,1588C2279.99,2160.93 1815.1,2626.74 1241.66,2627.57C668.218,2628.4 201.986,2163.93 201.158,1591C200.33,1018.07 665.218,552.255 1238.66,551.426Z"/>
                </clipPath>
                <g clip-path="url(#_clip1)">
                    <g transform="matrix(0.991708,-0.128509,0.128509,0.991708,-228.102,262.043)">
                        <path d="M1065,1439L1065,935L1649,945L1637,1338L1146,1340L1065,1439Z" style="fill:white;stroke:white;stroke-width:33.33px;"/>
                    </g>
                    <g transform="matrix(1,0,0,1,20,139.959)">
                        <path d="M2040,1361L555,1548L464,1735C464,1735 768.539,1592.36 1186.37,1784.98C1264.35,1820.93 1412.76,1896.18 1483.89,1923.31C1550.64,1948.76 1550.32,1942 1550.32,1942C1550.32,1942 1731.41,1881.4 1868.23,1746.98C2007.81,1609.85 2040,1361 2040,1361Z" style="fill:white;stroke:white;stroke-width:33.33px;"/>
                    </g>
                    <path d="M193.867,2099.37C193.867,2099.37 397.602,1886.93 782.157,1886.94C1166.71,1886.95 1416.36,2162.01 1678.31,2162C2028.41,2161.98 2169.09,2016.09 2362.66,1889.94C2385.1,1875.31 2144.3,2770.21 1172.16,2755C504.824,2744.56 193.867,2099.37 193.867,2099.37Z" style="fill:rgb(185,194,208);"/>
                </g>
            </g>
            <g transform="matrix(1.18595,0,0,1.18489,-514.453,-477.544)">
                <circle cx="1479.5" cy="1744.5" r="946.5" style="fill:none;stroke:white;stroke-width:56.24px;"/>
            </g>
        </g>
    </g>
</svg>

        <br> ${kcSanitize(msg("emailHeader", realmName))?no_esc}</h1>

</header>
<div class="kc-content" style="text-align: center;  padding: 2rem 2rem 2rem 2rem;">
${kcSanitize(msg("identityProviderLinkBodyHtml", identityProviderAlias, realmName, identityProviderContext.username, link, linkExpiration, linkExpirationFormatter(linkExpiration),user.getFirstName()))?no_esc}
<div>
    <footer class="kc-info" style="text-align: right; background-color: #e1e1e1; padding: 1rem 2rem 1rem 2rem; box-sizing: border-box;" >
        <p>Follow us!</p>
        <p><a href="https://www.linkedin.com/company/yacht-chat/">
                <svg version="1.1" width="27px" height="27px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                     viewBox="0 0 382 382" style="enable-background:new 0 0 382 382;" xml:space="preserve">
            <path style="fill:#0077B7;" d="M347.445,0H34.555C15.471,0,0,15.471,0,34.555v312.889C0,366.529,15.471,382,34.555,382h312.889
	C366.529,382,382,366.529,382,347.444V34.555C382,15.471,366.529,0,347.445,0z M118.207,329.844c0,5.554-4.502,10.056-10.056,10.056
	H65.345c-5.554,0-10.056-4.502-10.056-10.056V150.403c0-5.554,4.502-10.056,10.056-10.056h42.806
	c5.554,0,10.056,4.502,10.056,10.056V329.844z M86.748,123.432c-22.459,0-40.666-18.207-40.666-40.666S64.289,42.1,86.748,42.1
	s40.666,18.207,40.666,40.666S109.208,123.432,86.748,123.432z M341.91,330.654c0,5.106-4.14,9.246-9.246,9.246H286.73
	c-5.106,0-9.246-4.14-9.246-9.246v-84.168c0-12.556,3.683-55.021-32.813-55.021c-28.309,0-34.051,29.066-35.204,42.11v97.079
	c0,5.106-4.139,9.246-9.246,9.246h-44.426c-5.106,0-9.246-4.14-9.246-9.246V149.593c0-5.106,4.14-9.246,9.246-9.246h44.426
	c5.106,0,9.246,4.14,9.246,9.246v15.655c10.497-15.753,26.097-27.912,59.312-27.912c73.552,0,73.131,68.716,73.131,106.472
	L341.91,330.654L341.91,330.654z"/>
                    <g>
                    </g>
                    <g>
                    </g>
                    <g>
                    </g>
                    <g>
                    </g>
                    <g>
                    </g>
                    <g>
                    </g>
                    <g>
                    </g>
                    <g>
                    </g>
                    <g>
                    </g>
                    <g>
                    </g>
                    <g>
                    </g>
                    <g>
                    </g>
                    <g>
                    </g>
                    <g>
                    </g>
                    <g>
                    </g>

        </svg></a>
            <a href="https://instagram.com/yacht.chat/">
                <svg version="1.1" width="27px" height="27px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                     viewBox="0 0 551.034 551.034" style="enable-background:new 0 0 551.034 551.034;" xml:space="preserve">
<g id="XMLID_13_">

    <linearGradient id="XMLID_2_" gradientUnits="userSpaceOnUse" x1="275.517" y1="4.5714" x2="275.517" y2="549.7202" gradientTransform="matrix(1 0 0 -1 0 554)">
        <stop  offset="0" style="stop-color:#E09B3D"/>
        <stop  offset="0.3" style="stop-color:#C74C4D"/>
        <stop  offset="0.6" style="stop-color:#C21975"/>
        <stop  offset="1" style="stop-color:#7024C4"/>
    </linearGradient>
    <path id="XMLID_17_" style="fill:url(#XMLID_2_);" d="M386.878,0H164.156C73.64,0,0,73.64,0,164.156v222.722
		c0,90.516,73.64,164.156,164.156,164.156h222.722c90.516,0,164.156-73.64,164.156-164.156V164.156
		C551.033,73.64,477.393,0,386.878,0z M495.6,386.878c0,60.045-48.677,108.722-108.722,108.722H164.156
		c-60.045,0-108.722-48.677-108.722-108.722V164.156c0-60.046,48.677-108.722,108.722-108.722h222.722
		c60.045,0,108.722,48.676,108.722,108.722L495.6,386.878L495.6,386.878z"/>

    <linearGradient id="XMLID_3_" gradientUnits="userSpaceOnUse" x1="275.517" y1="4.5714" x2="275.517" y2="549.7202" gradientTransform="matrix(1 0 0 -1 0 554)">
        <stop  offset="0" style="stop-color:#E09B3D"/>
        <stop  offset="0.3" style="stop-color:#C74C4D"/>
        <stop  offset="0.6" style="stop-color:#C21975"/>
        <stop  offset="1" style="stop-color:#7024C4"/>
    </linearGradient>
    <path id="XMLID_81_" style="fill:url(#XMLID_3_);" d="M275.517,133C196.933,133,133,196.933,133,275.516
		s63.933,142.517,142.517,142.517S418.034,354.1,418.034,275.516S354.101,133,275.517,133z M275.517,362.6
		c-48.095,0-87.083-38.988-87.083-87.083s38.989-87.083,87.083-87.083c48.095,0,87.083,38.988,87.083,87.083
		C362.6,323.611,323.611,362.6,275.517,362.6z"/>

    <linearGradient id="XMLID_4_" gradientUnits="userSpaceOnUse" x1="418.306" y1="4.5714" x2="418.306" y2="549.7202" gradientTransform="matrix(1 0 0 -1 0 554)">
        <stop  offset="0" style="stop-color:#E09B3D"/>
        <stop  offset="0.3" style="stop-color:#C74C4D"/>
        <stop  offset="0.6" style="stop-color:#C21975"/>
        <stop  offset="1" style="stop-color:#7024C4"/>
    </linearGradient>
    <circle id="XMLID_83_" style="fill:url(#XMLID_4_);" cx="418.306" cy="134.072" r="34.149"/>
</g>
                    <g>
                    </g>
                    <g>
                    </g>
                    <g>
                    </g>
                    <g>
                    </g>
                    <g>
                    </g>
                    <g>
                    </g>
                    <g>
                    </g>
                    <g>
                    </g>
                    <g>
                    </g>
                    <g>
                    </g>
                    <g>
                    </g>
                    <g>
                    </g>
                    <g>
                    </g>
                    <g>
                    </g>
                    <g>
                    </g>
</svg></a></p>
    </footer>
</body>
</html>