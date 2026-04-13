/**
 *
 * (c) Copyright Ascensio System SIA 2026
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

package com.worldoffice.integration.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import com.worldoffice.model.commandservice.CommandRequest;
import com.worldoffice.model.commandservice.CommandResponse;
import com.worldoffice.model.commandservice.commandrequest.Command;
import com.worldoffice.manager.document.DocumentManager;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;


@CrossOrigin("*")
@Controller
public class ForgottenController {
    private static final Logger logger = LoggerFactory.getLogger(ForgottenController.class);
    @Value("${server.version}")
    private String serverVersion;

    @Value("${enable-forgotten}")
    private String enableForgotten;

    @Autowired
    private DocumentManager documentManager;

    @Autowired
    private DocumentServerClient documentServerClient;

    @GetMapping("${url.forgotten}")
    public String index(final Model model) {
        if (!forgottenEnabled()) {
            model.addAttribute("error", "The forgotten page is disabled");
            return "error.html";
        }

        model.addAttribute("files", getForgottenFiles());
        model.addAttribute("serverVersion", serverVersion);

        return "forgotten.html";
    }

    private ArrayList<ForgottenFile> getForgottenFiles() {
        ArrayList<ForgottenFile> files = new ArrayList<ForgottenFile>();
        try {
            CommandRequest commandRequest = CommandRequest.builder()
                .c(Command.GET_FORGOTTEN_LIST)
                .build();
            CommandResponse commandResponse = documentServerClient.command(commandRequest);
            List<String> keys = commandResponse.getKeys();
            for (int i = 0; i < keys.size(); i++) {
                commandRequest = CommandRequest.builder()
                        .c(Command.GET_FORGOTTEN)
                        .key(keys.get(i))
                        .build();
                commandResponse = documentServerClient.command(commandRequest);
                ForgottenFile file = new ForgottenFile(
                    commandResponse.getKey(),
                    documentManager.getDocumentType(commandResponse.getUrl()).toString().toLowerCase(),
                    commandResponse.getUrl()
                );
                files.add(file);
            }
        } catch (Exception e) {
            logger.error("Failed to get forgotten files", e);
            return files;
    }

    private boolean forgottenEnabled() {
        return Boolean.valueOf(enableForgotten);
    }

    @DeleteMapping("/forgotten/{filename}")
    public ResponseEntity<String> delete(@PathVariable("filename") final String filename) {
        if (!forgottenEnabled()) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        try {
            CommandRequest commandRequest = CommandRequest.builder()
                .c(Command.DELETE_FORGOTTEN)
                .key(filename)
                .build();

            CommandResponse commandResponse = documentServerClient.command(commandRequest);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            logger.error("Failed to delete forgotten file: {}", filename, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
