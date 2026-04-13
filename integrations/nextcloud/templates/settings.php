<?php
/**
 *
 * (c) Copyright Ascensio System SIA 2026
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms of the GNU Affero General Public License
 * (AGPL) version 3 as published by the Free Software Foundation.
 * In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * For details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * The interactive user interfaces in modified source and object code versions of the Program
 * must display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical
 * writing content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0 International.
 * See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */

    style("worldoffice", "settings");
    style("worldoffice", "template");
    \OCP\Util::addScript("worldoffice", "worldoffice-settings", 'core');
    \OCP\Util::addScript("worldoffice", "worldoffice-template", 'core');

if ($_["tagsEnabled"]) {
    \OCP\Util::addScript("core", "dist/systemtags");
}
?>
<div class="section section-worldoffice section-worldoffice-addr">

    <div class="worldoffice-description">
        <h1><?php p($l->t("Welcome to World Office!")) ?></h1>
        <p><?php p($l->t("Edit and collaborate on text documents, spreadsheets, presentations, and PDFs within Nextcloud using World Office.")) ?></p>
        <div class="useful-links">
            <a href="https://helpcenter.worldoffice.org/integration/nextcloud.aspx" target="_blank"><?php p($l->t("Learn more")) ?></a>
            <a href="https://feedback.worldoffice.org/forums/966080-your-voice-matters?category_id=519288" target="_blank"><?php p($l->t("Suggest a feature")) ?></a>
        </div>
    </div>

    <div id="worldofficeAddrSettings">
        <h2><?php p($l->t("Server settings")) ?></h2>
        <p class="settings-hint"><?php p($l->t("World Office Location specifies the address of the server with the document services installed. Please change the '<documentserver>' for the server address in the below line.")) ?></p>

        <p><?php p($l->t("World Office address")) ?></p>
        <p><input id="worldofficeUrl" value="<?php p($_["documentserver"]) ?>" placeholder="https://<documentserver>/" type="text"></p>

        <p>
            <input type="checkbox" class="checkbox" id="worldofficeVerifyPeerOff"
                <?php if ($_["verifyPeerOff"]) { ?>checked="checked"<?php } ?> />
            <label for="worldofficeVerifyPeerOff"><?php p($l->t("Disable certificate verification (insecure)")) ?></label>
        </p>

        <p class="worldoffice-header"><?php p($l->t("Secret key (leave blank to disable)")) ?></p>
        <p class="groupbottom">
            <input id="worldofficeSecret" value="<?php p($_["secret"]) ?>" placeholder="secret" type="password" />
            <input type="checkbox" id="personal-show" class="hidden-visually" name="show" />
            <label id="worldofficeSecret-show" for="personal-show" class="personal-show-label"></label>
        </p>

        <p>
            <a id="worldofficeAdv" class="worldoffice-header">
                <?php p($l->t("Advanced server settings")) ?>
                <span class="icon icon-triangle-s"></span>
            </a>
        </p>
        <div id="worldofficeSecretPanel" class="worldoffice-hide">
            <p class="worldoffice-header"><?php p($l->t("Authorization header (leave blank to use default header)")) ?></p>
            <p><input id="worldofficeJwtHeader" value="<?php p($_["jwtHeader"]) ?>" placeholder="Authorization" type="text"></p>

            <p class="worldoffice-header"><?php p($l->t("World Office address for internal requests from the server")) ?></p>
            <p><input id="worldofficeInternalUrl" value="<?php p($_["documentserverInternal"]) ?>" placeholder="https://<documentserver>/" type="text"></p>

            <p class="worldoffice-header"><?php p($l->t("Server address for internal requests from World Office")) ?></p>
            <p><input id="worldofficeStorageUrl" value="<?php p($_["storageUrl"]) ?>" placeholder="<?php p($_["currentServer"]) ?>" type="text"></p>
        </div>
    </div>

    <br />
    <div>
        <button id="worldofficeAddrSave" class="button primary"><?php p($l->t("Save")) ?></button>

        <div class="worldoffice-demo">
            <input type="checkbox" class="checkbox" id="worldofficeDemo"
                <?php if ($_["demo"]["enabled"]) { ?>checked="checked"<?php } ?>
                <?php if (!$_["demo"]["available"]) { ?>disabled="disabled"<?php } ?> />
            <label for="worldofficeDemo"><?php p($l->t("Connect to demo World Office server")) ?></label>

            <br />
            <?php if ($_["demo"]["available"]) { ?>
            <em><?php p($l->t("This is a public test server, please do not use it for private sensitive data. The server will be available during a 30-day period.")) ?></em>
            <?php } else { ?>
            <em><?php p($l->t("The 30-day test period is over, you can no longer connect to demo World Office server.")) ?></em>
            <?php } ?>
        </div>
    </div>

</div>

<div class="section section-worldoffice section-worldoffice-common <?php if (empty($_["documentserver"]) && !$_["demo"]["enabled"] || !$_["successful"]) { ?>worldoffice-hide<?php } ?>">
    <h2><?php p($l->t("Common settings")) ?></h2>

    <p>
        <input type="checkbox" class="checkbox" id="worldofficeGroups"
            <?php if (count($_["limitGroups"]) > 0) { ?>checked="checked"<?php } ?> />
        <label for="worldofficeGroups"><?php p($l->t("Allow the following groups to access the editors")) ?></label>
        <input type="hidden" id="worldofficeLimitGroups" value="<?php p(implode("|", $_["limitGroups"])) ?>" style="display: block" />
    </p>

    <p>
        <input type="checkbox" class="checkbox" id="worldofficePreview"
            <?php if ($_["preview"]) { ?>checked="checked"<?php } ?> />
        <label for="worldofficePreview"><?php p($l->t("Use World Office to generate a document preview (it will take up disk space)")) ?></label>
    </p>

    <p>
        <input type="checkbox" class="checkbox" id="worldofficeSameTab"
            <?php if ($_["sameTab"]) { ?>checked="checked"<?php } ?> />
        <label for="worldofficeSameTab"><?php p($l->t("Open file in the same tab")) ?></label>
    </p>

    <p <?php if ($_["sameTab"]) { ?> style="display: none" <?php } ?> id="worldofficeEnableSharingBlock">
        <input type="checkbox" class="checkbox" id="worldofficeEnableSharing"
            <?php if ($_["enableSharing"]) { ?>checked="checked"<?php } ?> />
        <label for="worldofficeEnableSharing"><?php p($l->t("Enable sharing (might increase editors loading time)")) ?></label>
    </p>

    <p>
        <input type="checkbox" class="checkbox" id="worldofficeAdvanced"
            <?php if ($_["advanced"]) { ?>checked="checked"<?php } ?> />
        <label for="worldofficeAdvanced"><?php p($l->t("Provide advanced document permissions using World Office")) ?></label>
    </p>

    <p>
        <input type="checkbox" class="checkbox" id="worldofficeVersionHistory"
            <?php if ($_["versionHistory"]) { ?>checked="checked"<?php } ?> />
        <label for="worldofficeVersionHistory"><?php p($l->t("Keep metadata for each version once the document is edited (it will take up disk space)")) ?></label>
        <button id="worldofficeClearVersionHistory" class="button"><?php p($l->t("Clear")) ?></button>
    </p>

    <p>
        <input type="checkbox" class="checkbox" id="worldofficeCronChecker"
            <?php if ($_["cronChecker"]) { ?>checked="checked"<?php } ?> />
        <label for="worldofficeCronChecker"><?php p($l->t("Enable background connection check to the editors")) ?></label>
    </p>

    <p>
        <input type="checkbox" class="checkbox" id="worldofficeEmailNotifications"
            <?php if ($_["emailNotifications"]) { ?>checked="checked"<?php } ?> />
        <label for="worldofficeEmailNotifications"><?php p($l->t("Enable e-mail notifications")) ?></label>
    </p>

    <p class="worldoffice-header">
        <?php p($l->t("Unknown author display name")) ?>
    </p>
    <p><input id="worldofficeUnknownAuthor" value="<?php p($_["unknownAuthor"]) ?>" placeholder="" type="text"></p>

    <p class="worldoffice-header"><?php p($l->t("The default application for opening the format")) ?></p>
    <div class="worldoffice-exts">
        <?php foreach ($_["formats"] as $format => $setting) { ?>
            <?php if (array_key_exists("mime", $setting)) { ?>
            <div>
                <input type="checkbox" class="checkbox"
                    id="worldofficeDefFormat<?php p($format) ?>"
                    name="<?php p($format) ?>"
                    <?php if (array_key_exists("def", $setting) && $setting["def"]) { ?>checked="checked"<?php } ?> />
                <label for="worldofficeDefFormat<?php p($format) ?>"><?php p($format) ?></label>
            </div>
            <?php } ?>
        <?php } ?>
    </div>

    <p class="worldoffice-header">
        <?php p($l->t("Open the file for editing (due to format restrictions, the data might be lost when saving to the formats from the list below)")) ?>
    </p>
    <div class="worldoffice-exts">
        <?php foreach ($_["formats"] as $format => $setting) { ?>
            <?php if (array_key_exists("editable", $setting) && $setting["editable"]) { ?>
            <div>
                <input type="checkbox" class="checkbox"
                    id="worldofficeEditFormat<?php p($format) ?>"
                    name="<?php p($format) ?>"
                    <?php if (array_key_exists("edit", $setting) && $setting["edit"]) { ?>checked="checked"<?php } ?> />
                <label for="worldofficeEditFormat<?php p($format) ?>"><?php p($format) ?></label>
            </div>
            <?php } ?>
        <?php } ?>
    </div>
    <br />

    <h2>
        <?php p($l->t("Editor customization settings")) ?>
    </h2>

    <p>
        <input type="checkbox" class="checkbox" id="worldofficeForcesave"
            <?php if ($_["forcesave"]) { ?>checked="checked"<?php } ?> />
        <label for="worldofficeForcesave"><?php p($l->t("Keep intermediate versions when editing (forcesave)")) ?></label>
    </p>

    <p>
        <input type="checkbox" class="checkbox" id="worldofficeLiveViewOnShare"
            <?php if ($_["liveViewOnShare"]) { ?>checked="checked"<?php } ?> />
        <label for="worldofficeLiveViewOnShare"><?php p($l->t("Enable live-viewing mode when accessing file by public link")) ?></label>
    </p>

    <p class="worldoffice-header">
        <?php p($l->t("The customization section allows personalizing the editor interface")) ?>
    </p>

    <p>
        <input type="checkbox" class="checkbox" id="worldofficeChat"
            <?php if ($_["chat"]) { ?>checked="checked"<?php } ?> />
        <label for="worldofficeChat"><?php p($l->t("Display Chat menu button")) ?></label>
    </p>

    <p>
        <input type="checkbox" class="checkbox" id="worldofficeCompactHeader"
            <?php if ($_["compactHeader"]) { ?>checked="checked"<?php } ?> />
        <label for="worldofficeCompactHeader"><?php p($l->t("Display the header more compact")) ?></label>
    </p>

    <p>
        <input type="checkbox" class="checkbox" id="worldofficeFeedback"
            <?php if ($_["feedback"]) { ?>checked="checked"<?php } ?> />
        <label for="worldofficeFeedback"><?php p($l->t("Display Feedback & Support menu button")) ?></label>
    </p>

    <p>
        <input type="checkbox" class="checkbox" id="worldofficeHelp"
            <?php if ($_["help"]) { ?>checked="checked"<?php } ?> />
        <label for="worldofficeHelp"><?php p($l->t("Display Help menu button")) ?></label>
    </p>

    <p class="worldoffice-header">
        <?php p($l->t("REVIEW mode for viewing")) ?>
    </p>
    <div class="worldoffice-tables">
        <div>
            <input type="radio" class="radio"
                id="worldofficeReviewDisplay_markup"
                name="reviewDisplay"
                <?php if ($_["reviewDisplay"] === "markup") { ?>checked="checked"<?php } ?> />
            <label for="worldofficeReviewDisplay_markup"><?php p($l->t("Markup")) ?></label>
        </div>
        <div>
            <input type="radio" class="radio"
                id="worldofficeReviewDisplay_final"
                name="reviewDisplay"
                <?php if ($_["reviewDisplay"] === "final") { ?>checked="checked"<?php } ?> />
            <label for="worldofficeReviewDisplay_final"><?php p($l->t("Final")) ?></label>
        </div>
        <div>
            <input type="radio" class="radio"
                id="worldofficeReviewDisplay_original"
                name="reviewDisplay"
                <?php if ($_["reviewDisplay"] === "original") { ?>checked="checked"<?php } ?> />
            <label for="worldofficeReviewDisplay_original"><?php p($l->t("Original")) ?></label>
        </div>
    </div>

    <p class="worldoffice-header">
        <?php p($l->t("Default editor theme")) ?>
    </p>
    <div class="worldoffice-tables">
        <div>
            <input type="radio" class="radio"
                id="worldofficeTheme_theme-system"
                name="theme"
                <?php if ($_["theme"] === "theme-system") { ?>checked="checked"<?php } ?> />
            <label for="worldofficeTheme_theme-system"><?php p($l->t("Same as system")) ?></label>
        </div>
        <div>
            <input type="radio" class="radio"
                id="worldofficeTheme_default-light"
                name="theme"
                <?php if ($_["theme"] === "default-light") { ?>checked="checked"<?php } ?> />
            <label for="worldofficeTheme_default-light"><?php p($l->t("Light")) ?></label>
        </div>
        <div>
            <input type="radio" class="radio"
                id="worldofficeTheme_default-dark"
                name="theme"
                <?php if ($_["theme"] === "default-dark") { ?>checked="checked"<?php } ?> />
            <label for="worldofficeTheme_default-dark"><?php p($l->t("Dark")) ?></label>
        </div>
    </div>

    <br />
    <p><button id="worldofficeSave" class="button primary"><?php p($l->t("Save")) ?></button></p>
</div>

<div class="section section-worldoffice section-worldoffice-templates <?php if (empty($_["documentserver"]) && !$_["demo"]["enabled"] || !$_["successful"]) { ?>worldoffice-hide<?php } ?>">

    <h2>
        <?php p($l->t("Common templates")) ?>
        <input id="worldofficeAddTemplate" type="file" class="hidden-visually" />
        <label for="worldofficeAddTemplate" class="icon-add" title="<?php p($l->t("Add a new template")) ?>"></label>
    </h2>
    <ul class="worldoffice-template-container">
        <?php foreach ($_["templates"] as $template) { ?>
            <li data-id=<?php p($template["id"]) ?> class="worldoffice-template-item" >
                <img src="<?php p($template["icon"]) ?>" />
                <p><?php p($template["name"]) ?></p>
                <span class="worldoffice-template-download"></span>
                <span class="worldoffice-template-delete icon-delete"></span>
            </li>
        <?php } ?>
    </ul>

</div>

<div class="section section-worldoffice section-worldoffice-watermark <?php if (empty($_["documentserver"]) && !$_["demo"]["enabled"] || !$_["successful"]) { ?>worldoffice-hide<?php } ?>">
    <h2><?php p($l->t("Security")) ?></h2>

    <p>
        <input type="checkbox" class="checkbox" id="worldofficePlugins"
            <?php if ($_["plugins"]) { ?>checked="checked"<?php } ?> />
        <label for="worldofficePlugins"><?php p($l->t("Enable plugins")) ?></label>
    </p>

    <p>
        <input type="checkbox" class="checkbox" id="worldofficeMacros"
            <?php if ($_["macros"]) { ?>checked="checked"<?php } ?> />
        <label for="worldofficeMacros"><?php p($l->t("Run document macros")) ?></label>
    </p>

    <p class="worldoffice-header">
        <?php p($l->t("Enable document protection for")) ?>
    </p>
    <div class="worldoffice-tables">
        <div>
            <input type="radio" class="radio"
                id="worldofficeProtection_all"
                name="protection"
                <?php if ($_["protection"] === "all") { ?>checked="checked"<?php } ?> />
            <label for="worldofficeProtection_all"><?php p($l->t("All users")) ?></label>
        </div>
        <div>
            <input type="radio" class="radio"
                id="worldofficeProtection_owner"
                name="protection"
                <?php if ($_["protection"] === "owner") { ?>checked="checked"<?php } ?> />
            <label for="worldofficeProtection_owner"><?php p($l->t("Owner only")) ?></label>
        </div>
    </div>

    <br />
    <p class="settings-hint"><?php p($l->t("Secure view enables you to secure documents by embedding a watermark")) ?></p>

    <p>
        <input type="checkbox" class="checkbox" id="worldofficeWatermark_enabled"
            <?php if ($_["watermark"]["enabled"]) { ?>checked="checked"<?php } ?> />
        <label for="worldofficeWatermark_enabled"><?php p($l->t("Enable watermarking")) ?></label>
    </p>

    <div id="worldofficeWatermarkSettings" <?php if (!$_["watermark"]["enabled"]) { ?>class="worldoffice-hide"<?php } ?> >
        <br />
        <p><?php p($l->t("Watermark text")) ?></p>
        <br />
        <p class="settings-hint"><?php p($l->t("Supported placeholders")) ?>: {userId}, {userDisplayName}, {email}, {date}, {themingName}</p>
        <p><input id="worldofficeWatermark_text" value="<?php p($_["watermark"]["text"]) ?>" placeholder="<?php p($l->t("DO NOT SHARE THIS")) ?> {userId} {date}" type="text"></p>

        <br />
        <?php if ($_["tagsEnabled"]) { ?>
        <p>
            <input type="checkbox" class="checkbox" id="worldofficeWatermark_allTags"
                <?php if ($_["watermark"]["allTags"]) { ?>checked="checked"<?php } ?> />
            <label for="worldofficeWatermark_allTags"><?php p($l->t("Show watermark on tagged files")) ?></label>
            <input type="hidden" id="worldofficeWatermark_allTagsList" value="<?php p(implode("|", $_["watermark"]["allTagsList"])) ?>" style="display: block" />
        </p>
        <?php } ?>

        <p>
            <input type="checkbox" class="checkbox" id="worldofficeWatermark_allGroups"
                <?php if ($_["watermark"]["allGroups"]) { ?>checked="checked"<?php } ?> />
            <label for="worldofficeWatermark_allGroups"><?php p($l->t("Show watermark for users of groups")) ?></label>
            <input type="hidden" id="worldofficeWatermark_allGroupsList" value="<?php p(implode("|", $_["watermark"]["allGroupsList"])) ?>" style="display: block" />
        </p>

        <p>
            <input type="checkbox" class="checkbox" id="worldofficeWatermark_shareAll"
                <?php if ($_["watermark"]["shareAll"]) { ?>checked="checked"<?php } ?> />
            <label for="worldofficeWatermark_shareAll"><?php p($l->t("Show watermark for all shares")) ?></label>
        </p>

        <p <?php if ($_["watermark"]["shareAll"]) { ?>class="worldoffice-hide"<?php } ?> >
            <input type="checkbox" class="checkbox" id="worldofficeWatermark_shareRead"
                <?php if ($_["watermark"]["shareRead"]) { ?>checked="checked"<?php } ?> />
            <label for="worldofficeWatermark_shareRead"><?php p($l->t("Show watermark for read only shares")) ?></label>
        </p>

        <br />
        <p><?php p($l->t("Link shares")) ?></p>
        <p>
            <input type="checkbox" class="checkbox" id="worldofficeWatermark_linkAll"
                <?php if ($_["watermark"]["linkAll"]) { ?>checked="checked"<?php } ?> />
            <label for="worldofficeWatermark_linkAll"><?php p($l->t("Show watermark for all link shares")) ?></label>
        </p>

        <div id="worldofficeWatermark_link_sensitive" <?php if ($_["watermark"]["linkAll"]) { ?>class="worldoffice-hide"<?php } ?> >
            <p>
                <input type="checkbox" class="checkbox" id="worldofficeWatermark_linkSecure"
                    <?php if ($_["watermark"]["linkSecure"]) { ?>checked="checked"<?php } ?> />
                <label for="worldofficeWatermark_linkSecure"><?php p($l->t("Show watermark for download hidden shares")) ?></label>
            </p>

            <p>
                <input type="checkbox" class="checkbox" id="worldofficeWatermark_linkRead"
                    <?php if ($_["watermark"]["linkRead"]) { ?>checked="checked"<?php } ?> />
                <label for="worldofficeWatermark_linkRead"><?php p($l->t("Show watermark for read only link shares")) ?></label>
            </p>

            <?php if ($_["tagsEnabled"]) { ?>
            <p>
                <input type="checkbox" class="checkbox" id="worldofficeWatermark_linkTags"
                    <?php if ($_["watermark"]["linkTags"]) { ?>checked="checked"<?php } ?> />
                <label for="worldofficeWatermark_linkTags"><?php p($l->t("Show watermark on link shares with specific system tags")) ?></label>
                <input type="hidden" id="worldofficeWatermark_linkTagsList" value="<?php p(implode("|", $_["watermark"]["linkTagsList"])) ?>" style="display: block" />
            </p>
            <?php } ?>
        </div>
    </div>

    <br />
    <p><button id="worldofficeSecuritySave" class="button primary"><?php p($l->t("Save")) ?></button></p>

    <input type ="hidden" id="worldofficeSettingsState" value="<?php p($_["settingsError"]) ?>" />
</div>
