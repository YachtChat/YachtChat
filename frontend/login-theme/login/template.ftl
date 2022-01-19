<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayRequiredFields=false showAnotherWayIfPresent=true>
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
            "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" class="${properties.kcHtmlClass!}">

    <head>
        <meta charset="utf-8">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <meta name="robots" content="noindex, nofollow">

        <#if properties.meta?has_content>
            <#list properties.meta?split(' ') as meta>
                <meta name="${meta?split('==')[0]}" content="${meta?split('==')[1]}"/>
            </#list>
        </#if>
        <title>${msg("loginTitle",(realm.displayName!''))}</title>
        <link rel="icon" href="${url.resourcesPath}/img/favicon.ico"/>
        <#if properties.stylesCommon?has_content>
            <#list properties.stylesCommon?split(' ') as style>
                <link href="${url.resourcesCommonPath}/${style}" rel="stylesheet"/>
            </#list>
        </#if>
        <#if properties.styles?has_content>
            <#list properties.styles?split(' ') as style>
                <link href="${url.resourcesPath}/${style}" rel="stylesheet"/>
            </#list>
        </#if>
        <#if properties.scripts?has_content>
            <#list properties.scripts?split(' ') as script>
                <script src="${url.resourcesPath}/${script}" type="text/javascript"></script>
            </#list>
        </#if>
        <#if scripts??>
            <#list scripts as script>
                <script src="${script}" type="text/javascript"></script>
            </#list>
        </#if>
    </head>

    <body class="${properties.kcBodyClass!}">
    <div class="${properties.kcLoginClass!} contentWrapper">
        <div class="backgroundRange"></div>
        <div class="backgroundBall"></div>
        <div id="nav-content">
            <div class="logo">
                <svg class="logo-pic" width="100%" height="100%" viewBox="0 0 2796 2796"
                     style="fill-rule: evenodd; clip-rule: evenodd; stroke-linecap: round; stroke-linejoin: round;">
                    <g transform="matrix(1,0,0,1,-355,-196)">
                        <g id="V6_light" transform="matrix(1,0,0,1,513.78,0)">
                            <g>
                                <g>
                                    <g transform="matrix(0.991708,-0.128509,0.128509,0.991708,-228.102,262.043)">
                                        <path d="M1065,1439L1065,935L1649,945L1637,1338L1146,1340L1065,1439Z"
                                              style="fill: white; stroke: white; stroke-width: 33.33px;"></path>
                                    </g>
                                    <g transform="matrix(1,0,0,1,20,139.959)">
                                        <path d="M2040,1361L555,1548L464,1735C464,1735 768.539,1592.36 1186.37,1784.98C1264.35,1820.93 1412.76,1896.18 1483.89,1923.31C1550.64,1948.76 1550.32,1942 1550.32,1942C1550.32,1942 1731.41,1881.4 1868.23,1746.98C2007.81,1609.85 2040,1361 2040,1361Z"
                                              style="fill: white; stroke: white; stroke-width: 33.33px;"></path>
                                    </g>
                                    <path d="M193.867,2099.37C193.867,2099.37 397.602,1886.93 782.157,1886.94C1166.71,1886.95 1416.36,2162.01 1678.31,2162C2028.41,2161.98 2169.09,2016.09 2362.66,1889.94C2385.1,1875.31 2144.3,2770.21 1172.16,2755C504.824,2744.56 193.867,2099.37 193.867,2099.37Z"
                                          style="fill: rgb(185, 194, 208);"></path>
                                </g>
                            </g>
                            <g transform="matrix(1.18595,0,0,1.18489,-514.453,-477.544)">
                                <circle cx="1479.5" cy="1744.5" r="946.5"
                                        style="fill: none; stroke: white; stroke-width: 56.24px;"></circle>
                            </g>
                        </g>
                    </g>
                </svg>
            </div>
        </div>
        <div class="contentBox">
            <div class="${properties.kcFormCardClass!} login-box">
                <header class="${properties.kcFormHeaderClass!} headlineBox signin">
                    <#if realm.internationalizationEnabled  && locale.supported?size gt 1>
                        <div id="kc-locale">
                            <div id="kc-locale-wrapper" class="${properties.kcLocaleWrapperClass!}">
                                <div class="kc-dropdown" id="kc-locale-dropdown">
                                    <a href="#" id="kc-current-locale-link">${locale.current}</a>
                                    <ul>
                                        <#list locale.supported as l>
                                            <li class="kc-dropdown-item"><a href="${l.url}">${l.label}</a></li>
                                        </#list>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </#if>
                    <#if !(auth?has_content && auth.showUsername() && !auth.showResetCredentials())>
                        <#if displayRequiredFields>
                            <div class="${properties.kcContentWrapperClass!}">
                                <div class="${properties.kcLabelWrapperClass!} subtitle">
                                    <span class="subtitle"><span
                                                class="required">*</span> ${msg("requiredFields")}</span>
                                </div>
                                <div class="col-md-10">
                                    <#nested "header">
                                </div>
                            </div>
                        <#else>
                            <#nested "header">
                        </#if>
                    <#else>
                        <#if displayRequiredFields>
                            <div class="${properties.kcContentWrapperClass!}">
                                <div class="${properties.kcLabelWrapperClass!} subtitle">
                                    <span class="subtitle"><span class="required">*</span> ${msg("requiredFields")}</span>
                                </div>
                                <div class="col-md-10">
                                    <#nested "show-username">
                                    <div id="kc-username" class="${properties.kcFormGroupClass!}">
                                        <label id="kc-attempted-username">${auth.attemptedUsername}</label>
                                        <a id="reset-login" href="${url.loginRestartFlowUrl}">
                                            <div class="kc-login-tooltip">
                                                <i class="${properties.kcResetFlowIcon!}"></i>
                                                <span class="kc-tooltip-text">${msg("restartLoginTooltip")}</span>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        <#else>
                            <#nested "show-username">
                            <div id="kc-username" class="${properties.kcFormGroupClass!}">
                                <label id="kc-attempted-username">${auth.attemptedUsername}</label>
                                <a id="reset-login" href="${url.loginRestartFlowUrl}">
                                    <div class="kc-login-tooltip">
                                        <i class="${properties.kcResetFlowIcon!}"></i>
                                        <span class="kc-tooltip-text">${msg("restartLoginTooltip")}</span>
                                    </div>
                                </a>
                            </div>
                        </#if>
                    </#if>
                </header>
                <div id="kc-content" class="user-box">
                    <div id="kc-content-wrapper">

                        <#-- App-initiated actions should not see warning messages about the need to complete the action -->
                        <#-- during login.                                                                               -->
                        <#if displayMessage && message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
                            <div class="alert-${message.type} ${properties.kcAlertClass!} pf-m-<#if message.type = 'error'>danger<#else>${message.type}</#if>">
                                <div class="pf-c-alert__icon">
                                    <#if message.type = 'success'><span
                                        class="${properties.kcFeedbackSuccessIcon!}"></span></#if>
                                    <#if message.type = 'warning'><span
                                        class="${properties.kcFeedbackWarningIcon!}"></span></#if>
                                    <#if message.type = 'error'><span
                                        class="${properties.kcFeedbackErrorIcon!}"></span></#if>
                                    <#if message.type = 'info'><span
                                        class="${properties.kcFeedbackInfoIcon!}"></span></#if>
                                </div>
                                <span class="${properties.kcAlertTitleClass!}">${kcSanitize(message.summary)?no_esc}</span>
                            </div>
                        </#if>

                        <#nested "form">

                        <#if auth?has_content && auth.showTryAnotherWayLink() && showAnotherWayIfPresent>
                            <form id="kc-select-try-another-way-form" action="${url.loginAction}" method="post">
                                <div class="${properties.kcFormGroupClass!}">
                                    <input type="hidden" name="tryAnotherWay" value="on"/>
                                    <a href="#" id="try-another-way"
                                       onclick="document.forms['kc-select-try-another-way-form'].submit();return false;">${msg("doTryAnotherWay")}</a>
                                </div>
                            </form>
                        </#if>

                    </div>
                </div>
                <#if displayInfo>
                    <footer id="kc-info" class="${properties.kcSignUpClass!} info">
                        <div id="kc-info-wrapper" class="${properties.kcInfoAreaWrapperClass!}">
                            <#nested "info">
                        </div>
                    </footer>
                </#if>
            </div>
        </div>
    </div>
    </body>
    </html>
</#macro>
