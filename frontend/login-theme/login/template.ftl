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
    <div id="navigation">
        <div class="contentWrapper">
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
<#--                    <img class="logo-text light" alt="yacht.chat" src="data:image/png;base64,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">-->
                </div>
            </div>
        </div>
    </div>
    <div class="${properties.kcLoginClass!} contentWrapper">
        <div class="backgroundRange"></div>
        <div class="backgroundBall"></div>
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
                                    <span class="subtitle"><span
                                                class="required">*</span> ${msg("requiredFields")}</span>
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
