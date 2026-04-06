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

    style("world-office", "settings");
    style("world-office", "template");
    \OCP\Util::addScript("world-office", "world-office-settings", 'core');
    \OCP\Util::addScript("world-office", "world-office-template", 'core');

if ($_["tagsEnabled"]) {
    \OCP\Util::addScript("core", "dist/systemtags");
}
?>
<div class="section section-world-office section-world-office-addr">

    <div class="world-office-description">
        <h1><?php p($l->t("Welcome to Euro-Office!")) ?></h1>
        <p><?php p($l->t("Edit and collaborate on text documents, spreadsheets, presentations, and PDFs within Nextcloud using Euro-Office.")) ?></p>
        <div class="useful-links">
            <a href="https://helpcenter.world-office.com/integration/nextcloud.aspx" target="_blank"><?php p($l->t("Learn more")) ?></a>
            <a href="https://feedback.world-office.com/forums/966080-your-voice-matters?category_id=519288" target="_blank"><?php p($l->t("Suggest a feature")) ?></a>
        </div>
    </div>

    <div id="world-officeAddrSettings">
        <h2><?php p($l->t("Server settings")) ?></h2>
        <p class="settings-hint"><?php p($l->t("Euro-Office Location specifies the address of the server with the document services installed. Please change the '<documentserver>' for the server address in the below line.")) ?></p>

        <p><?php p($l->t("Euro-Office address")) ?></p>
        <p><input id="world-officeUrl" value="<?php p($_["documentserver"]) ?>" placeholder="https://<documentserver>/" type="text"></p>

        <p>
            <input type="checkbox" class="checkbox" id="world-officeVerifyPeerOff"
                <?php if ($_["verifyPeerOff"]) { ?>checked="checked"<?php } ?> />
            <label for="world-officeVerifyPeerOff"><?php p($l->t("Disable certificate verification (insecure)")) ?></label>
        </p>

        <p class="world-office-header"><?php p($l->t("Secret key (leave blank to disable)")) ?></p>
        <p class="groupbottom">
            <input id="world-officeSecret" value="<?php p($_["secret"]) ?>" placeholder="secret" type="password" />
            <input type="checkbox" id="personal-show" class="hidden-visually" name="show" />
            <label id="world-officeSecret-show" for="personal-show" class="personal-show-label"></label>
        </p>

        <p>
            <a id="world-officeAdv" class="world-office-header">
                <?php p($l->t("Advanced server settings")) ?>
                <span class="icon icon-triangle-s"></span>
            </a>
        </p>
        <div id="world-officeSecretPanel" class="world-office-hide">
            <p class="world-office-header"><?php p($l->t("Authorization header (leave blank to use default header)")) ?></p>
            <p><input id="world-officeJwtHeader" value="<?php p($_["jwtHeader"]) ?>" placeholder="Authorization" type="text"></p>

            <p class="world-office-header"><?php p($l->t("Euro-Office address for internal requests from the server")) ?></p>
            <p><input id="world-officeInternalUrl" value="<?php p($_["documentserverInternal"]) ?>" placeholder="https://<documentserver>/" type="text"></p>

            <p class="world-office-header"><?php p($l->t("Server address for internal requests from Euro-Office")) ?></p>
            <p><input id="world-officeStorageUrl" value="<?php p($_["storageUrl"]) ?>" placeholder="<?php p($_["currentServer"]) ?>" type="text"></p>
        </div>
    </div>

    <br />
    <div>
        <button id="world-officeAddrSave" class="button primary"><?php p($l->t("Save")) ?></button>

        <div class="world-office-demo">
            <input type="checkbox" class="checkbox" id="world-officeDemo"
                <?php if ($_["demo"]["enabled"]) { ?>checked="checked"<?php } ?>
                <?php if (!$_["demo"]["available"]) { ?>disabled="disabled"<?php } ?> />
            <label for="world-officeDemo"><?php p($l->t("Connect to demo Euro-Office server")) ?></label>

            <br />
            <?php if ($_["demo"]["available"]) { ?>
            <em><?php p($l->t("This is a public test server, please do not use it for private sensitive data. The server will be available during a 30-day period.")) ?></em>
            <?php } else { ?>
            <em><?php p($l->t("The 30-day test period is over, you can no longer connect to demo Euro-Office server.")) ?></em>
            <?php } ?>
        </div>
    </div>

</div>

<div class="section section-world-office section-world-office-common <?php if (empty($_["documentserver"]) && !$_["demo"]["enabled"] || !$_["successful"]) { ?>world-office-hide<?php } ?>">
    <h2><?php p($l->t("Common settings")) ?></h2>

    <p>
        <input type="checkbox" class="checkbox" id="world-officeGroups"
            <?php if (count($_["limitGroups"]) > 0) { ?>checked="checked"<?php } ?> />
        <label for="world-officeGroups"><?php p($l->t("Allow the following groups to access the editors")) ?></label>
        <input type="hidden" id="world-officeLimitGroups" value="<?php p(implode("|", $_["limitGroups"])) ?>" style="display: block" />
    </p>

    <p>
        <input type="checkbox" class="checkbox" id="world-officePreview"
            <?php if ($_["preview"]) { ?>checked="checked"<?php } ?> />
        <label for="world-officePreview"><?php p($l->t("Use Euro-Office to generate a document preview (it will take up disk space)")) ?></label>
    </p>

    <p>
        <input type="checkbox" class="checkbox" id="world-officeSameTab"
            <?php if ($_["sameTab"]) { ?>checked="checked"<?php } ?> />
        <label for="world-officeSameTab"><?php p($l->t("Open file in the same tab")) ?></label>
    </p>

    <p <?php if ($_["sameTab"]) { ?> style="display: none" <?php } ?> id="world-officeEnableSharingBlock">
        <input type="checkbox" class="checkbox" id="world-officeEnableSharing"
            <?php if ($_["enableSharing"]) { ?>checked="checked"<?php } ?> />
        <label for="world-officeEnableSharing"><?php p($l->t("Enable sharing (might increase editors loading time)")) ?></label>
    </p>

    <p>
        <input type="checkbox" class="checkbox" id="world-officeAdvanced"
            <?php if ($_["advanced"]) { ?>checked="checked"<?php } ?> />
        <label for="world-officeAdvanced"><?php p($l->t("Provide advanced document permissions using Euro-Office")) ?></label>
    </p>

    <p>
        <input type="checkbox" class="checkbox" id="world-officeVersionHistory"
            <?php if ($_["versionHistory"]) { ?>checked="checked"<?php } ?> />
        <label for="world-officeVersionHistory"><?php p($l->t("Keep metadata for each version once the document is edited (it will take up disk space)")) ?></label>
        <button id="world-officeClearVersionHistory" class="button"><?php p($l->t("Clear")) ?></button>
    </p>

    <p>
        <input type="checkbox" class="checkbox" id="world-officeCronChecker"
            <?php if ($_["cronChecker"]) { ?>checked="checked"<?php } ?> />
        <label for="world-officeCronChecker"><?php p($l->t("Enable background connection check to the editors")) ?></label>
    </p>

    <p>
        <input type="checkbox" class="checkbox" id="world-officeEmailNotifications"
            <?php if ($_["emailNotifications"]) { ?>checked="checked"<?php } ?> />
        <label for="world-officeEmailNotifications"><?php p($l->t("Enable e-mail notifications")) ?></label>
    </p>

    <p class="world-office-header">
        <?php p($l->t("Unknown author display name")) ?>
    </p>
    <p><input id="world-officeUnknownAuthor" value="<?php p($_["unknownAuthor"]) ?>" placeholder="" type="text"></p>

    <p class="world-office-header"><?php p($l->t("The default application for opening the format")) ?></p>
    <div class="world-office-exts">
        <?php foreach ($_["formats"] as $format => $setting) { ?>
            <?php if (array_key_exists("mime", $setting)) { ?>
            <div>
                <input type="checkbox" class="checkbox"
                    id="world-officeDefFormat<?php p($format) ?>"
                    name="<?php p($format) ?>"
                    <?php if (array_key_exists("def", $setting) && $setting["def"]) { ?>checked="checked"<?php } ?> />
                <label for="world-officeDefFormat<?php p($format) ?>"><?php p($format) ?></label>
            </div>
            <?php } ?>
        <?php } ?>
    </div>

    <p class="world-office-header">
        <?php p($l->t("Open the file for editing (due to format restrictions, the data might be lost when saving to the formats from the list below)")) ?>
    </p>
    <div class="world-office-exts">
        <?php foreach ($_["formats"] as $format => $setting) { ?>
            <?php if (array_key_exists("editable", $setting) && $setting["editable"]) { ?>
            <div>
                <input type="checkbox" class="checkbox"
                    id="world-officeEditFormat<?php p($format) ?>"
                    name="<?php p($format) ?>"
                    <?php if (array_key_exists("edit", $setting) && $setting["edit"]) { ?>checked="checked"<?php } ?> />
                <label for="world-officeEditFormat<?php p($format) ?>"><?php p($format) ?></label>
            </div>
            <?php } ?>
        <?php } ?>
    </div>
    <br />

    <h2>
        <?php p($l->t("Editor customization settings")) ?>
    </h2>

    <p>
        <input type="checkbox" class="checkbox" id="world-officeForcesave"
            <?php if ($_["forcesave"]) { ?>checked="checked"<?php } ?> />
        <label for="world-officeForcesave"><?php p($l->t("Keep intermediate versions when editing (forcesave)")) ?></label>
    </p>

    <p>
        <input type="checkbox" class="checkbox" id="world-officeLiveViewOnShare"
            <?php if ($_["liveViewOnShare"]) { ?>checked="checked"<?php } ?> />
        <label for="world-officeLiveViewOnShare"><?php p($l->t("Enable live-viewing mode when accessing file by public link")) ?></label>
    </p>

    <p class="world-office-header">
        <?php p($l->t("The customization section allows personalizing the editor interface")) ?>
    </p>

    <p>
        <input type="checkbox" class="checkbox" id="world-officeChat"
            <?php if ($_["chat"]) { ?>checked="checked"<?php } ?> />
        <label for="world-officeChat"><?php p($l->t("Display Chat menu button")) ?></label>
    </p>

    <p>
        <input type="checkbox" class="checkbox" id="world-officeCompactHeader"
            <?php if ($_["compactHeader"]) { ?>checked="checked"<?php } ?> />
        <label for="world-officeCompactHeader"><?php p($l->t("Display the header more compact")) ?></label>
    </p>

    <p>
        <input type="checkbox" class="checkbox" id="world-officeFeedback"
            <?php if ($_["feedback"]) { ?>checked="checked"<?php } ?> />
        <label for="world-officeFeedback"><?php p($l->t("Display Feedback & Support menu button")) ?></label>
    </p>

    <p>
        <input type="checkbox" class="checkbox" id="world-officeHelp"
            <?php if ($_["help"]) { ?>checked="checked"<?php } ?> />
        <label for="world-officeHelp"><?php p($l->t("Display Help menu button")) ?></label>
    </p>

    <p class="world-office-header">
        <?php p($l->t("REVIEW mode for viewing")) ?>
    </p>
    <div class="world-office-tables">
        <div>
            <input type="radio" class="radio"
                id="world-officeReviewDisplay_markup"
                name="reviewDisplay"
                <?php if ($_["reviewDisplay"] === "markup") { ?>checked="checked"<?php } ?> />
            <label for="world-officeReviewDisplay_markup"><?php p($l->t("Markup")) ?></label>
        </div>
        <div>
            <input type="radio" class="radio"
                id="world-officeReviewDisplay_final"
                name="reviewDisplay"
                <?php if ($_["reviewDisplay"] === "final") { ?>checked="checked"<?php } ?> />
            <label for="world-officeReviewDisplay_final"><?php p($l->t("Final")) ?></label>
        </div>
        <div>
            <input type="radio" class="radio"
                id="world-officeReviewDisplay_original"
                name="reviewDisplay"
                <?php if ($_["reviewDisplay"] === "original") { ?>checked="checked"<?php } ?> />
            <label for="world-officeReviewDisplay_original"><?php p($l->t("Original")) ?></label>
        </div>
    </div>

    <p class="world-office-header">
        <?php p($l->t("Default editor theme")) ?>
    </p>
    <div class="world-office-tables">
        <div>
            <input type="radio" class="radio"
                id="world-officeTheme_theme-system"
                name="theme"
                <?php if ($_["theme"] === "theme-system") { ?>checked="checked"<?php } ?> />
            <label for="world-officeTheme_theme-system"><?php p($l->t("Same as system")) ?></label>
        </div>
        <div>
            <input type="radio" class="radio"
                id="world-officeTheme_default-light"
                name="theme"
                <?php if ($_["theme"] === "default-light") { ?>checked="checked"<?php } ?> />
            <label for="world-officeTheme_default-light"><?php p($l->t("Light")) ?></label>
        </div>
        <div>
            <input type="radio" class="radio"
                id="world-officeTheme_default-dark"
                name="theme"
                <?php if ($_["theme"] === "default-dark") { ?>checked="checked"<?php } ?> />
            <label for="world-officeTheme_default-dark"><?php p($l->t("Dark")) ?></label>
        </div>
    </div>

    <br />
    <p><button id="world-officeSave" class="button primary"><?php p($l->t("Save")) ?></button></p>
</div>

<div class="section section-world-office section-world-office-templates <?php if (empty($_["documentserver"]) && !$_["demo"]["enabled"] || !$_["successful"]) { ?>world-office-hide<?php } ?>">

    <h2>
        <?php p($l->t("Common templates")) ?>
        <input id="world-officeAddTemplate" type="file" class="hidden-visually" />
        <label for="world-officeAddTemplate" class="icon-add" title="<?php p($l->t("Add a new template")) ?>"></label>
    </h2>
    <ul class="world-office-template-container">
        <?php foreach ($_["templates"] as $template) { ?>
            <li data-id=<?php p($template["id"]) ?> class="world-office-template-item" >
                <img src="<?php p($template["icon"]) ?>" />
                <p><?php p($template["name"]) ?></p>
                <span class="world-office-template-download"></span>
                <span class="world-office-template-delete icon-delete"></span>
            </li>
        <?php } ?>
    </ul>

</div>

<div class="section section-world-office section-world-office-watermark <?php if (empty($_["documentserver"]) && !$_["demo"]["enabled"] || !$_["successful"]) { ?>world-office-hide<?php } ?>">
    <h2><?php p($l->t("Security")) ?></h2>

    <p>
        <input type="checkbox" class="checkbox" id="world-officePlugins"
            <?php if ($_["plugins"]) { ?>checked="checked"<?php } ?> />
        <label for="world-officePlugins"><?php p($l->t("Enable plugins")) ?></label>
    </p>

    <p>
        <input type="checkbox" class="checkbox" id="world-officeMacros"
            <?php if ($_["macros"]) { ?>checked="checked"<?php } ?> />
        <label for="world-officeMacros"><?php p($l->t("Run document macros")) ?></label>
    </p>

    <p class="world-office-header">
        <?php p($l->t("Enable document protection for")) ?>
    </p>
    <div class="world-office-tables">
        <div>
            <input type="radio" class="radio"
                id="world-officeProtection_all"
                name="protection"
                <?php if ($_["protection"] === "all") { ?>checked="checked"<?php } ?> />
            <label for="world-officeProtection_all"><?php p($l->t("All users")) ?></label>
        </div>
        <div>
            <input type="radio" class="radio"
                id="world-officeProtection_owner"
                name="protection"
                <?php if ($_["protection"] === "owner") { ?>checked="checked"<?php } ?> />
            <label for="world-officeProtection_owner"><?php p($l->t("Owner only")) ?></label>
        </div>
    </div>

    <br />
    <p class="settings-hint"><?php p($l->t("Secure view enables you to secure documents by embedding a watermark")) ?></p>

    <p>
        <input type="checkbox" class="checkbox" id="world-officeWatermark_enabled"
            <?php if ($_["watermark"]["enabled"]) { ?>checked="checked"<?php } ?> />
        <label for="world-officeWatermark_enabled"><?php p($l->t("Enable watermarking")) ?></label>
    </p>

    <div id="world-officeWatermarkSettings" <?php if (!$_["watermark"]["enabled"]) { ?>class="world-office-hide"<?php } ?> >
        <br />
        <p><?php p($l->t("Watermark text")) ?></p>
        <br />
        <p class="settings-hint"><?php p($l->t("Supported placeholders")) ?>: {userId}, {userDisplayName}, {email}, {date}, {themingName}</p>
        <p><input id="world-officeWatermark_text" value="<?php p($_["watermark"]["text"]) ?>" placeholder="<?php p($l->t("DO NOT SHARE THIS")) ?> {userId} {date}" type="text"></p>

        <br />
        <?php if ($_["tagsEnabled"]) { ?>
        <p>
            <input type="checkbox" class="checkbox" id="world-officeWatermark_allTags"
                <?php if ($_["watermark"]["allTags"]) { ?>checked="checked"<?php } ?> />
            <label for="world-officeWatermark_allTags"><?php p($l->t("Show watermark on tagged files")) ?></label>
            <input type="hidden" id="world-officeWatermark_allTagsList" value="<?php p(implode("|", $_["watermark"]["allTagsList"])) ?>" style="display: block" />
        </p>
        <?php } ?>

        <p>
            <input type="checkbox" class="checkbox" id="world-officeWatermark_allGroups"
                <?php if ($_["watermark"]["allGroups"]) { ?>checked="checked"<?php } ?> />
            <label for="world-officeWatermark_allGroups"><?php p($l->t("Show watermark for users of groups")) ?></label>
            <input type="hidden" id="world-officeWatermark_allGroupsList" value="<?php p(implode("|", $_["watermark"]["allGroupsList"])) ?>" style="display: block" />
        </p>

        <p>
            <input type="checkbox" class="checkbox" id="world-officeWatermark_shareAll"
                <?php if ($_["watermark"]["shareAll"]) { ?>checked="checked"<?php } ?> />
            <label for="world-officeWatermark_shareAll"><?php p($l->t("Show watermark for all shares")) ?></label>
        </p>

        <p <?php if ($_["watermark"]["shareAll"]) { ?>class="world-office-hide"<?php } ?> >
            <input type="checkbox" class="checkbox" id="world-officeWatermark_shareRead"
                <?php if ($_["watermark"]["shareRead"]) { ?>checked="checked"<?php } ?> />
            <label for="world-officeWatermark_shareRead"><?php p($l->t("Show watermark for read only shares")) ?></label>
        </p>

        <br />
        <p><?php p($l->t("Link shares")) ?></p>
        <p>
            <input type="checkbox" class="checkbox" id="world-officeWatermark_linkAll"
                <?php if ($_["watermark"]["linkAll"]) { ?>checked="checked"<?php } ?> />
            <label for="world-officeWatermark_linkAll"><?php p($l->t("Show watermark for all link shares")) ?></label>
        </p>

        <div id="world-officeWatermark_link_sensitive" <?php if ($_["watermark"]["linkAll"]) { ?>class="world-office-hide"<?php } ?> >
            <p>
                <input type="checkbox" class="checkbox" id="world-officeWatermark_linkSecure"
                    <?php if ($_["watermark"]["linkSecure"]) { ?>checked="checked"<?php } ?> />
                <label for="world-officeWatermark_linkSecure"><?php p($l->t("Show watermark for download hidden shares")) ?></label>
            </p>

            <p>
                <input type="checkbox" class="checkbox" id="world-officeWatermark_linkRead"
                    <?php if ($_["watermark"]["linkRead"]) { ?>checked="checked"<?php } ?> />
                <label for="world-officeWatermark_linkRead"><?php p($l->t("Show watermark for read only link shares")) ?></label>
            </p>

            <?php if ($_["tagsEnabled"]) { ?>
            <p>
                <input type="checkbox" class="checkbox" id="world-officeWatermark_linkTags"
                    <?php if ($_["watermark"]["linkTags"]) { ?>checked="checked"<?php } ?> />
                <label for="world-officeWatermark_linkTags"><?php p($l->t("Show watermark on link shares with specific system tags")) ?></label>
                <input type="hidden" id="world-officeWatermark_linkTagsList" value="<?php p(implode("|", $_["watermark"]["linkTagsList"])) ?>" style="display: block" />
            </p>
            <?php } ?>
        </div>
    </div>

    <br />
    <p><button id="world-officeSecuritySave" class="button primary"><?php p($l->t("Save")) ?></button></p>

    <input type ="hidden" id="world-officeSettingsState" value="<?php p($_["settingsError"]) ?>" />
</div>
