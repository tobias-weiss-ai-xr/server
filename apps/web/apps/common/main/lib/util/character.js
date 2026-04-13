;((window, undefined) => {
  const lcid_unknown = 0x0000 // Unknown
  const lcid_ar = 0x0001 // Arabic
  const lcid_bg = 0x0002 // Bulgarian
  const lcid_ca = 0x0003 // Catalan
  const lcid_zhHans = 0x0004 // Chinese, Han (Simplified variant)
  const lcid_cs = 0x0005 // Czech
  const lcid_da = 0x0006 // Danish
  const lcid_de = 0x0007 // German
  const lcid_el = 0x0008 // Modern Greek (1453-)
  const lcid_en = 0x0009 // English
  const lcid_es = 0x000a // Spanish
  const lcid_fi = 0x000b // Finnish
  const lcid_fr = 0x000c // French
  const lcid_he = 0x000d // Hebrew
  const lcid_hu = 0x000e // Hungarian
  const lcid_is = 0x000f // Icelandic
  const lcid_it = 0x0010 // Italian
  const lcid_ja = 0x0011 // Japanese
  const lcid_ko = 0x0012 // Korean
  const lcid_nl = 0x0013 // Dutch
  const lcid_no = 0x0014 // Norwegian
  const lcid_pl = 0x0015 // Polish
  const lcid_pt = 0x0016 // Portuguese
  const lcid_rm = 0x0017 // Romansh
  const lcid_ro = 0x0018 // Romanian
  const lcid_ru = 0x0019 // Russian
  const lcid_hr = 0x001a // Croatian
  const lcid_sk = 0x001b // Slovak
  const lcid_sq = 0x001c // Albanian
  const lcid_sv = 0x001d // Swedish
  const lcid_th = 0x001e // Thai
  const lcid_tr = 0x001f // Turkish
  const lcid_ur = 0x0020 // Urdu
  const lcid_id = 0x0021 // Indonesian
  const lcid_uk = 0x0022 // Ukrainian
  const lcid_be = 0x0023 // Belarusian
  const lcid_sl = 0x0024 // Slovenian
  const lcid_et = 0x0025 // Estonian
  const lcid_lv = 0x0026 // Latvian
  const lcid_lt = 0x0027 // Lithuanian
  const lcid_tg = 0x0028 // Tajik
  const lcid_fa = 0x0029 // Persian
  const lcid_vi = 0x002a // Vietnamese
  const lcid_hy = 0x002b // Armenian
  const lcid_az = 0x002c // Azerbaijani
  const lcid_eu = 0x002d // Basque
  const lcid_hsb = 0x002e // Upper Sorbian
  const lcid_mk = 0x002f // Macedonian
  const lcid_tn = 0x0032 // Tswana
  const lcid_xh = 0x0034 // Xhosa
  const lcid_zu = 0x0035 // Zulu
  const lcid_af = 0x0036 // Afrikaans
  const lcid_ka = 0x0037 // Georgian
  const lcid_fo = 0x0038 // Faroese
  const lcid_hi = 0x0039 // Hindi
  const lcid_mt = 0x003a // Maltese
  const lcid_se = 0x003b // Northern Sami
  const lcid_ga = 0x003c // Irish
  const lcid_ms = 0x003e // Malay (macrolanguage)
  const lcid_kk = 0x003f // Kazakh
  const lcid_ky = 0x0040 // Kirghiz
  const lcid_sw = 0x0041 // Swahili (macrolanguage)
  const lcid_tk = 0x0042 // Turkmen
  const lcid_uz = 0x0043 // Uzbek
  const lcid_tt = 0x0044 // Tatar
  const lcid_bn = 0x0045 // Bengali
  const lcid_pa = 0x0046 // Panjabi
  const lcid_gu = 0x0047 // Gujarati
  const lcid_or = 0x0048 // Oriya
  const lcid_ta = 0x0049 // Tamil
  const lcid_te = 0x004a // Telugu
  const lcid_kn = 0x004b // Kannada
  const lcid_ml = 0x004c // Malayalam
  const lcid_as = 0x004d // Assamese
  const lcid_mr = 0x004e // Marathi
  const lcid_sa = 0x004f // Sanskrit
  const lcid_mn = 0x0050 // Mongolian
  const lcid_bo = 0x0051 // Tibetan
  const lcid_cy = 0x0052 // Welsh
  const lcid_km = 0x0053 // Central Khmer
  const lcid_lo = 0x0054 // Lao
  const lcid_gl = 0x0056 // Galician
  const lcid_kok = 0x0057 // Konkani (macrolanguage)
  const lcid_syr = 0x005a // Syriac
  const lcid_si = 0x005b // Sinhala
  const lcid_iu = 0x005d // Inuktitut
  const lcid_am = 0x005e // Amharic
  const lcid_tzm = 0x005f // Central Atlas Tamazight
  const lcid_ne = 0x0061 // Nepali
  const lcid_fy = 0x0062 // Western Frisian
  const lcid_ps = 0x0063 // Pushto
  const lcid_fil = 0x0064 // Filipino
  const lcid_dv = 0x0065 // Dhivehi
  const lcid_ha = 0x0068 // Hausa
  const lcid_yo = 0x006a // Yoruba
  const lcid_quz = 0x006b // Cusco Quechua
  const lcid_nso = 0x006c // Pedi
  const lcid_ba = 0x006d // Bashkir
  const lcid_lb = 0x006e // Luxembourgish
  const lcid_kl = 0x006f // Kalaallisut
  const lcid_ig = 0x0070 // Igbo
  const lcid_ii = 0x0078 // Sichuan Yi
  const lcid_arn = 0x007a // Mapudungun
  const lcid_moh = 0x007c // Mohawk
  const lcid_br = 0x007e // Breton
  const lcid_ug = 0x0080 // Uighur
  const lcid_mi = 0x0081 // Maori
  const lcid_oc = 0x0082 // Occitan (post 1500)
  const lcid_co = 0x0083 // Corsican
  const lcid_gsw = 0x0084 // Swiss German
  const lcid_sah = 0x0085 // Yakut
  const lcid_qut = 0x0086 //
  const lcid_rw = 0x0087 // Kinyarwanda
  const lcid_wo = 0x0088 // Wolof
  const lcid_prs = 0x008c // Dari
  const lcid_gd = 0x0091 // Scottish Gaelic
  const lcid_arSA = 0x0401 // Arabic, Saudi Arabia
  const lcid_bgBG = 0x0402 // Bulgarian, Bulgaria
  const lcid_caES = 0x0403 // Catalan, Spain
  const lcid_zhTW = 0x0404 // Chinese, Taiwan, Province of China
  const lcid_csCZ = 0x0405 // Czech, Czech Republic
  const lcid_daDK = 0x0406 // Danish, Denmark
  const lcid_deDE = 0x0407 // German, Germany
  const lcid_elGR = 0x0408 // Modern Greek (1453-), Greece
  const lcid_enUS = 0x0409 // English, United States
  const lcid_esES_tradnl = 0x040a // Spanish
  const lcid_fiFI = 0x040b // Finnish, Finland
  const lcid_frFR = 0x040c // French, France
  const lcid_heIL = 0x040d // Hebrew, Israel
  const lcid_huHU = 0x040e // Hungarian, Hungary
  const lcid_isIS = 0x040f // Icelandic, Iceland
  const lcid_itIT = 0x0410 // Italian, Italy
  const lcid_jaJP = 0x0411 // Japanese, Japan
  const lcid_koKR = 0x0412 // Korean, Republic of Korea
  const lcid_nlNL = 0x0413 // Dutch, Netherlands
  const lcid_nbNO = 0x0414 // Norwegian Bokmal, Norway
  const lcid_plPL = 0x0415 // Polish, Poland
  const lcid_ptBR = 0x0416 // Portuguese, Brazil
  const lcid_rmCH = 0x0417 // Romansh, Switzerland
  const lcid_roRO = 0x0418 // Romanian, Romania
  const lcid_ruRU = 0x0419 // Russian, Russian Federation
  const lcid_hrHR = 0x041a // Croatian, Croatia
  const lcid_skSK = 0x041b // Slovak, Slovakia
  const lcid_sqAL = 0x041c // Albanian, Albania
  const lcid_svSE = 0x041d // Swedish, Sweden
  const lcid_thTH = 0x041e // Thai, Thailand
  const lcid_trTR = 0x041f // Turkish, Turkey
  const lcid_urPK = 0x0420 // Urdu, Pakistan
  const lcid_idID = 0x0421 // Indonesian, Indonesia
  const lcid_ukUA = 0x0422 // Ukrainian, Ukraine
  const lcid_beBY = 0x0423 // Belarusian, Belarus
  const lcid_slSI = 0x0424 // Slovenian, Slovenia
  const lcid_etEE = 0x0425 // Estonian, Estonia
  const lcid_lvLV = 0x0426 // Latvian, Latvia
  const lcid_ltLT = 0x0427 // Lithuanian, Lithuania
  const lcid_tgCyrlTJ = 0x0428 // Tajik, Cyrillic, Tajikistan
  const lcid_faIR = 0x0429 // Persian, Islamic Republic of Iran
  const lcid_viVN = 0x042a // Vietnamese, Viet Nam
  const lcid_hyAM = 0x042b // Armenian, Armenia
  const lcid_azLatnAZ = 0x042c // Azerbaijani, Latin, Azerbaijan
  const lcid_euES = 0x042d // Basque, Spain
  const lcid_wenDE = 0x042e // Sorbian languages, Germany
  const lcid_mkMK = 0x042f // Macedonian, The Former Yugoslav Republic of Macedonia
  const lcid_stZA = 0x0430 // Southern Sotho, South Africa
  const lcid_tsZA = 0x0431 // Tsonga, South Africa
  const lcid_tnZA = 0x0432 // Tswana, South Africa
  const lcid_venZA = 0x0433 // South Africa
  const lcid_xhZA = 0x0434 // Xhosa, South Africa
  const lcid_zuZA = 0x0435 // Zulu, South Africa
  const lcid_afZA = 0x0436 // Afrikaans, South Africa
  const lcid_kaGE = 0x0437 // Georgian, Georgia
  const lcid_foFO = 0x0438 // Faroese, Faroe Islands
  const lcid_hiIN = 0x0439 // Hindi, India
  const lcid_mtMT = 0x043a // Maltese, Malta
  const lcid_seNO = 0x043b // Northern Sami, Norway
  const lcid_msMY = 0x043e // Malay (macrolanguage), Malaysia
  const lcid_kkKZ = 0x043f // Kazakh, Kazakhstan
  const lcid_kyKG = 0x0440 // Kirghiz, Kyrgyzstan
  const lcid_swKE = 0x0441 // Swahili (macrolanguage), Kenya
  const lcid_tkTM = 0x0442 // Turkmen, Turkmenistan
  const lcid_uzLatnUZ = 0x0443 // Uzbek, Latin, Uzbekistan
  const lcid_ttRU = 0x0444 // Tatar, Russian Federation
  const lcid_bnIN = 0x0445 // Bengali, India
  const lcid_paIN = 0x0446 // Panjabi, India
  const lcid_guIN = 0x0447 // Gujarati, India
  const lcid_orIN = 0x0448 // Oriya, India
  const lcid_taIN = 0x0449 // Tamil, India
  const lcid_teIN = 0x044a // Telugu, India
  const lcid_knIN = 0x044b // Kannada, India
  const lcid_mlIN = 0x044c // Malayalam, India
  const lcid_asIN = 0x044d // Assamese, India
  const lcid_mrIN = 0x044e // Marathi, India
  const lcid_saIN = 0x044f // Sanskrit, India
  const lcid_mnMN = 0x0450 // Mongolian, Mongolia
  const lcid_boCN = 0x0451 // Tibetan, China
  const lcid_cyGB = 0x0452 // Welsh, United Kingdom
  const lcid_kmKH = 0x0453 // Central Khmer, Cambodia
  const lcid_loLA = 0x0454 // Lao, Lao People's Democratic Republic
  const lcid_myMM = 0x0455 // Burmese, Myanmar
  const lcid_glES = 0x0456 // Galician, Spain
  const lcid_kokIN = 0x0457 // Konkani (macrolanguage), India
  const lcid_mni = 0x0458 // Manipuri
  const lcid_sdIN = 0x0459 // Sindhi, India
  const lcid_syrSY = 0x045a // Syriac, Syrian Arab Republic
  const lcid_siLK = 0x045b // Sinhala, Sri Lanka
  const lcid_chrUS = 0x045c // Cherokee, United States
  const lcid_iuCansCA = 0x045d // Inuktitut, Unified Canadian Aboriginal Syllabics, Canada
  const lcid_amET = 0x045e // Amharic, Ethiopia
  const lcid_tmz = 0x045f // Tamanaku
  const lcid_neNP = 0x0461 // Nepali, Nepal
  const lcid_fyNL = 0x0462 // Western Frisian, Netherlands
  const lcid_psAF = 0x0463 // Pushto, Afghanistan
  const lcid_filPH = 0x0464 // Filipino, Philippines
  const lcid_dvMV = 0x0465 // Dhivehi, Maldives
  const lcid_binNG = 0x0466 // Bini, Nigeria
  const lcid_fuvNG = 0x0467 // Nigerian Fulfulde, Nigeria
  const lcid_haLatnNG = 0x0468 // Hausa, Latin, Nigeria
  const lcid_ibbNG = 0x0469 // Ibibio, Nigeria
  const lcid_yoNG = 0x046a // Yoruba, Nigeria
  const lcid_quzBO = 0x046b // Cusco Quechua, Bolivia
  const lcid_nsoZA = 0x046c // Pedi, South Africa
  const lcid_baRU = 0x046d // Bashkir, Russian Federation
  const lcid_lbLU = 0x046e // Luxembourgish, Luxembourg
  const lcid_klGL = 0x046f // Kalaallisut, Greenland
  const lcid_igNG = 0x0470 // Igbo, Nigeria
  const lcid_krNG = 0x0471 // Kanuri, Nigeria
  const lcid_gazET = 0x0472 // West Central Oromo, Ethiopia
  const lcid_tiER = 0x0473 // Tigrinya, Eritrea
  const lcid_gnPY = 0x0474 // Guarani, Paraguay
  const lcid_hawUS = 0x0475 // Hawaiian, United States
  const lcid_soSO = 0x0477 // Somali, Somalia
  const lcid_iiCN = 0x0478 // Sichuan Yi, China
  const lcid_papAN = 0x0479 // Papiamento, Netherlands Antilles
  const lcid_arnCL = 0x047a // Mapudungun, Chile
  const lcid_mohCA = 0x047c // Mohawk, Canada
  const lcid_brFR = 0x047e // Breton, France
  const lcid_ugCN = 0x0480 // Uighur, China
  const lcid_miNZ = 0x0481 // Maori, New Zealand
  const lcid_ocFR = 0x0482 // Occitan (post 1500), France
  const lcid_coFR = 0x0483 // Corsican, France
  const lcid_gswFR = 0x0484 // Swiss German, France
  const lcid_sahRU = 0x0485 // Yakut, Russian Federation
  const lcid_qutGT = 0x0486 // Guatemala
  const lcid_rwRW = 0x0487 // Kinyarwanda, Rwanda
  const lcid_woSN = 0x0488 // Wolof, Senegal
  const lcid_prsAF = 0x048c // Dari, Afghanistan
  const lcid_pltMG = 0x048d // Plateau Malagasy, Madagascar
  const lcid_gdGB = 0x0491 // Scottish Gaelic, United Kingdom
  const lcid_arIQ = 0x0801 // Arabic, Iraq
  const lcid_zhCN = 0x0804 // Chinese, China
  const lcid_deCH = 0x0807 // German, Switzerland
  const lcid_enGB = 0x0809 // English, United Kingdom
  const lcid_esMX = 0x080a // Spanish, Mexico
  const lcid_frBE = 0x080c // French, Belgium
  const lcid_itCH = 0x0810 // Italian, Switzerland
  const lcid_nlBE = 0x0813 // Dutch, Belgium
  const lcid_nnNO = 0x0814 // Norwegian Nynorsk, Norway
  const lcid_ptPT = 0x0816 // Portuguese, Portugal
  const lcid_roMO = 0x0818 // Romanian, Macao
  const lcid_ruMO = 0x0819 // Russian, Macao
  const lcid_srLatnCS = 0x081a // Serbian, Latin, Serbia and Montenegro
  const lcid_svFI = 0x081d // Swedish, Finland
  const lcid_urIN = 0x0820 // Urdu, India
  const lcid_azCyrlAZ = 0x082c // Azerbaijani, Cyrillic, Azerbaijan
  const lcid_dsbDE = 0x082e // Lower Sorbian, Germany
  const lcid_seSE = 0x083b // Northern Sami, Sweden
  const lcid_gaIE = 0x083c // Irish, Ireland
  const lcid_msBN = 0x083e // Malay (macrolanguage), Brunei Darussalam
  const lcid_uzCyrlUZ = 0x0843 // Uzbek, Cyrillic, Uzbekistan
  const lcid_bnBD = 0x0845 // Bengali, Bangladesh
  const lcid_paPK = 0x0846 // Panjabi, Pakistan
  const lcid_mnMongCN = 0x0850 // Mongolian, Mongolian, China
  const lcid_boBT = 0x0851 // Tibetan, Bhutan
  const lcid_sdPK = 0x0859 // Sindhi, Pakistan
  const lcid_iuLatnCA = 0x085d // Inuktitut, Latin, Canada
  const lcid_tzmLatnDZ = 0x085f // Central Atlas Tamazight, Latin, Algeria
  const lcid_neIN = 0x0861 // Nepali, India
  const lcid_quzEC = 0x086b // Cusco Quechua, Ecuador
  const lcid_tiET = 0x0873 // Tigrinya, Ethiopia
  const lcid_arEG = 0x0c01 // Arabic, Egypt
  const lcid_zhHK = 0x0c04 // Chinese, Hong Kong
  const lcid_deAT = 0x0c07 // German, Austria
  const lcid_enAU = 0x0c09 // English, Australia
  const lcid_esES = 0x0c0a // Spanish, Spain
  const lcid_frCA = 0x0c0c // French, Canada
  const lcid_srCyrlCS = 0x0c1a // Serbian, Cyrillic, Serbia and Montenegro
  const lcid_seFI = 0x0c3b // Northern Sami, Finland
  const lcid_tmzMA = 0x0c5f // Tamanaku, Morocco
  const lcid_quzPE = 0x0c6b // Cusco Quechua, Peru
  const lcid_arLY = 0x1001 // Arabic, Libyan Arab Jamahiriya
  const lcid_zhSG = 0x1004 // Chinese, Singapore
  const lcid_deLU = 0x1007 // German, Luxembourg
  const lcid_enCA = 0x1009 // English, Canada
  const lcid_esGT = 0x100a // Spanish, Guatemala
  const lcid_frCH = 0x100c // French, Switzerland
  const lcid_hrBA = 0x101a // Croatian, Bosnia and Herzegovina
  const lcid_smjNO = 0x103b // Lule Sami, Norway
  const lcid_arDZ = 0x1401 // Arabic, Algeria
  const lcid_zhMO = 0x1404 // Chinese, Macao
  const lcid_deLI = 0x1407 // German, Liechtenstein
  const lcid_enNZ = 0x1409 // English, New Zealand
  const lcid_esCR = 0x140a // Spanish, Costa Rica
  const lcid_frLU = 0x140c // French, Luxembourg
  const lcid_bsLatnBA = 0x141a // Bosnian, Latin, Bosnia and Herzegovina
  const lcid_smjSE = 0x143b // Lule Sami, Sweden
  const lcid_arMA = 0x1801 // Arabic, Morocco
  const lcid_enIE = 0x1809 // English, Ireland
  const lcid_esPA = 0x180a // Spanish, Panama
  const lcid_frMC = 0x180c // French, Monaco
  const lcid_srLatnBA = 0x181a // Serbian, Latin, Bosnia and Herzegovina
  const lcid_smaNO = 0x183b // Southern Sami, Norway
  const lcid_arTN = 0x1c01 // Arabic, Tunisia
  const lcid_enZA = 0x1c09 // English, South Africa
  const lcid_esDO = 0x1c0a // Spanish, Dominican Republic
  const lcid_frWest = 0x1c0c // French
  const lcid_srCyrlBA = 0x1c1a // Serbian, Cyrillic, Bosnia and Herzegovina
  const lcid_smaSE = 0x1c3b // Southern Sami, Sweden
  const lcid_arOM = 0x2001 // Arabic, Oman
  const lcid_enJM = 0x2009 // English, Jamaica
  const lcid_esVE = 0x200a // Spanish, Venezuela
  const lcid_frRE = 0x200c // French, Reunion
  const lcid_bsCyrlBA = 0x201a // Bosnian, Cyrillic, Bosnia and Herzegovina
  const lcid_smsFI = 0x203b // Skolt Sami, Finland
  const lcid_arYE = 0x2401 // Arabic, Yemen
  const lcid_enCB = 0x2409 // English
  const lcid_esCO = 0x240a // Spanish, Colombia
  const lcid_frCG = 0x240c // French, Congo
  const lcid_srLatnRS = 0x241a // Serbian, Latin, Serbia
  const lcid_smnFI = 0x243b // Inari Sami, Finland
  const lcid_arSY = 0x2801 // Arabic, Syrian Arab Republic
  const lcid_enBZ = 0x2809 // English, Belize
  const lcid_esPE = 0x280a // Spanish, Peru
  const lcid_frSN = 0x280c // French, Senegal
  const lcid_srCyrlRS = 0x281a // Serbian, Cyrillic, Serbia
  const lcid_arJO = 0x2c01 // Arabic, Jordan
  const lcid_enTT = 0x2c09 // English, Trinidad and Tobago
  const lcid_esAR = 0x2c0a // Spanish, Argentina
  const lcid_frCM = 0x2c0c // French, Cameroon
  const lcid_srLatnME = 0x2c1a // Serbian, Latin, Montenegro
  const lcid_arLB = 0x3001 // Arabic, Lebanon
  const lcid_enZW = 0x3009 // English, Zimbabwe
  const lcid_esEC = 0x300a // Spanish, Ecuador
  const lcid_frCI = 0x300c // French, Cote d'Ivoire
  const lcid_srCyrlME = 0x301a // Serbian, Cyrillic, Montenegro
  const lcid_arKW = 0x3401 // Arabic, Kuwait
  const lcid_enPH = 0x3409 // English, Philippines
  const lcid_esCL = 0x340a // Spanish, Chile
  const lcid_frML = 0x340c // French, Mali
  const lcid_arAE = 0x3801 // Arabic, United Arab Emirates
  const lcid_enID = 0x3809 // English, Indonesia
  const lcid_esUY = 0x380a // Spanish, Uruguay
  const lcid_frMA = 0x380c // French, Morocco
  const lcid_arBH = 0x3c01 // Arabic, Bahrain
  const lcid_enHK = 0x3c09 // English, Hong Kong
  const lcid_esPY = 0x3c0a // Spanish, Paraguay
  const lcid_frHT = 0x3c0c // French, Haiti
  const lcid_arQA = 0x4001 // Arabic, Qatar
  const lcid_enIN = 0x4009 // English, India
  const lcid_esBO = 0x400a // Spanish, Bolivia
  const lcid_enMY = 0x4409 // English, Malaysia
  const lcid_esSV = 0x440a // Spanish, El Salvador
  const lcid_enSG = 0x4809 // English, Singapore
  const lcid_esHN = 0x480a // Spanish, Honduras
  const lcid_esNI = 0x4c0a // Spanish, Nicaragua
  const lcid_esPR = 0x500a // Spanish, Puerto Rico
  const lcid_esUS = 0x540a // Spanish, United States
  const lcid_bsCyrl = 0x641a // Bosnian, Cyrillic
  const lcid_bsLatn = 0x681a // Bosnian, Latin
  const lcid_srCyrl = 0x6c1a // Serbian, Cyrillic
  const lcid_srLatn = 0x701a // Serbian, Latin
  const lcid_smn = 0x703b // Inari Sami
  const lcid_azCyrl = 0x742c // Azerbaijani, Cyrillic
  const lcid_sms = 0x743b // Skolt Sami
  const lcid_zh = 0x7804 // Chinese
  const lcid_nn = 0x7814 // Norwegian Nynorsk
  const lcid_bs = 0x781a // Bosnian
  const lcid_azLatn = 0x782c // Azerbaijani, Latin
  const lcid_sma = 0x783b // Southern Sami
  const lcid_uzCyrl = 0x7843 // Uzbek, Cyrillic
  const lcid_mnCyrl = 0x7850 // Mongolian, Cyrillic
  const lcid_iuCans = 0x785d // Inuktitut, Unified Canadian Aboriginal Syllabics
  const lcid_zhHant = 0x7c04 // Chinese, Han (Traditional variant)
  const lcid_nb = 0x7c14 // Norwegian Bokmal
  const lcid_sr = 0x7c1a // Serbian
  const lcid_tgCyrl = 0x7c28 // Tajik, Cyrillic
  const lcid_dsb = 0x7c2e // Lower Sorbian
  const lcid_smj = 0x7c3b // Lule Sami
  const lcid_uzLatn = 0x7c43 // Uzbek, Latin
  const lcid_mnMong = 0x7c50 // Mongolian, Mongolian
  const lcid_iuLatn = 0x7c5d // Inuktitut, Latin
  const lcid_tzmLatn = 0x7c5f // Central Atlas Tamazight, Latin
  const lcid_haLatn = 0x7c68 // Hausa, Latin

  /**
   * @enum {number}
   */
  const c_oUnicodeRangesLID = {
    Unknown: 0,
    Basic_Latin: 1,
    Latin_1_Supplement: 2,
    Latin_Extended_A: 3,
    Latin_Extended_B: 4,
    IPA_Extensions: 5,
    Spacing_Modifier_Letters: 6,
    Combining_Diacritical_Marks: 7,
    Greek_and_Coptic: 8,
    Cyrillic: 9,
    Cyrillic_Supplement: 10,
    Armenian: 11,
    Hebrew: 12,
    Arabic: 13,
    Syriac: 14,
    Arabic_Supplement: 15,
    Thaana: 16,
    NKo: 17,
    Samaritan: 18,
    Mandaic: 19,
    Arabic_Extended_A: 20,
    Devanagari: 21,
    Bengali: 22,
    Gurmukhi: 23,
    Gujarati: 24,
    Oriya: 25,
    Tamil: 26,
    Telugu: 27,
    Kannada: 28,
    Malayalam: 29,
    Sinhala: 30,
    Thai: 31,
    Lao: 32,
    Tibetan: 33,
    Myanmar: 34,
    Georgian: 35,
    Hangul_Jamo: 36,
    Ethiopic: 37,
    Ethiopic_Supplement: 38,
    Cherokee: 39,
    Unified_Canadian_Aboriginal_Syllabics: 40,
    Ogham: 41,
    Runic: 42,
    Tagalog: 43,
    Hanunoo: 44,
    Buhid: 45,
    Tagbanwa: 46,
    Khmer: 47,
    Mongolian: 48,
    Unified_Canadian_Aboriginal_Syllabics_Extended: 49,
    Limbu: 50,
    Tai_Le: 51,
    New_Tai_Lue: 52,
    Khmer_Symbols: 53,
    Buginese: 54,
    Tai_Tham: 55,
    Combining_Diacritical_Marks_Extended: 56,
    Balinese: 57,
    Sundanese: 58,
    Batak: 59,
    Lepcha: 60,
    Ol_Chiki: 61,
    Cyrillic_Extended_C: 62,
    Sundanese_Supplement: 63,
    Vedic_Extensions: 64,
    Phonetic_Extensions: 65,
    Phonetic_Extensions_Supplement: 66,
    Combining_Diacritical_Marks_Supplement: 67,
    Latin_Extended_Additional: 68,
    Greek_Extended: 69,
    General_Punctuation: 70,
    Superscripts_and_Subscripts: 71,
    Currency_Symbols: 72,
    Combining_Diacritical_Marks_for_Symbols: 73,
    Letterlike_Symbols: 74,
    Number_Forms: 75,
    Arrows: 76,
    Mathematical_Operators: 77,
    Miscellaneous_Technical: 78,
    Control_Pictures: 79,
    Optical_Character_Recognition: 80,
    Enclosed_Alphanumerics: 81,
    Box_Drawing: 82,
    Block_Elements: 83,
    Geometric_Shapes: 84,
    Miscellaneous_Symbols: 85,
    Dingbats: 86,
    Miscellaneous_Mathematical_Symbols_A: 87,
    Supplemental_Arrows_A: 88,
    Braille_Patterns: 89,
    Supplemental_Arrows_B: 90,
    Miscellaneous_Mathematical_Symbols_B: 91,
    Supplemental_Mathematical_Operators: 92,
    Miscellaneous_Symbols_and_Arrows: 93,
    Glagolitic: 94,
    Latin_Extended_C: 95,
    Coptic: 96,
    Georgian_Supplement: 97,
    Tifinagh: 98,
    Ethiopic_Extended: 99,
    Cyrillic_Extended_A: 100,
    Supplemental_Punctuation: 101,
    CJK_Radicals_Supplement: 102,
    Kangxi_Radicals: 103,
    Ideographic_Description_Characters: 104,
    CJK_Symbols_and_Punctuation: 105,
    Hiragana: 106,
    Katakana: 107,
    Bopomofo: 108,
    Hangul_Compatibility_Jamo: 109,
    Kanbun: 110,
    Bopomofo_Extended: 111,
    CJK_Strokes: 112,
    Katakana_Phonetic_Extensions: 113,
    Enclosed_CJK_Letters_and_Months: 114,
    CJK_Compatibility: 115,
    CJK_Unified_Ideographs_Extension: 116,
    Yijing_Hexagram_Symbols: 117,
    CJK_Unified_Ideographs: 118,
    Yi_Syllables: 119,
    Yi_Radicals: 120,
    Lisu: 121,
    Vai: 122,
    Cyrillic_Extended_B: 123,
    Bamum: 124,
    Modifier_Tone_Letters: 125,
    Latin_Extended_D: 126,
    Syloti_Nagri: 127,
    Common_Indic_Number_Forms: 128,
    Phags_pa: 129,
    Saurashtra: 130,
    Devanagari_Extended: 131,
    Kayah_Li: 132,
    Rejang: 133,
    Hangul_Jamo_Extended_A: 134,
    Javanese: 135,
    Myanmar_Extended_B: 136,
    Cham: 137,
    Myanmar_Extended_A: 138,
    Tai_Viet: 139,
    Meetei_Mayek_Extensions: 140,
    Ethiopic_Extended_A: 141,
    Latin_Extended_E: 142,
    Cherokee_Supplement: 143,
    Meetei_Mayek: 144,
    Hangul_Syllables: 145,
    Hangul_Jamo_Extended_B: 146,
    High_Surrogates: 147,
    High_Private_Use_Surrogates: 148,
    Low_Surrogates: 149,
    Private_Use_Area: 150,
    CJK_Compatibility_Ideographs: 151,
    Alphabetic_Presentation_Forms: 152,
    Arabic_Presentation_Forms_A: 153,
    Variation_Selectors: 154,
    Vertical_Forms: 155,
    Combining_Half_Marks: 156,
    CJK_Compatibility_Forms: 157,
    Small_Form_Variants: 158,
    Arabic_Presentation_Forms_B: 159,
    Halfwidth_and_Fullwidth_Forms: 160,
    Specials: 161,
    Linear_B_Syllabary: 162,
    Linear_B_Ideograms: 163,
    Aegean_Numbers: 164,
    Ancient_Greek_Numbers: 165,
    Ancient_Symbols: 166,
    Phaistos_Disc: 167,
    Lycian: 168,
    Carian: 169,
    Coptic_Epact_Numbers: 170,
    Old_Italic: 171,
    Gothic: 172,
    Old_Permic: 173,
    Ugaritic: 174,
    Old_Persian: 175,
    Deseret: 176,
    Shavian: 177,
    Osmanya: 178,
    Osage: 179,
    Elbasan: 180,
    Caucasian_Albanian: 181,
    Linear_A: 182,
    Cypriot_Syllabary: 183,
    Imperial_Aramaic: 184,
    Palmyrene: 185,
    Nabataean: 186,
    Hatran: 187,
    Phoenician: 188,
    Lydian: 189,
    Meroitic_Hieroglyphs: 190,
    Meroitic_Cursive: 191,
    Kharoshthi: 192,
    Old_South_Arabian: 193,
    Old_North_Arabian: 194,
    Manichaean: 195,
    Avestan: 196,
    Inscriptional_Parthian: 197,
    Inscriptional_Pahlavi: 198,
    Psalter_Pahlavi: 199,
    Old_Turkic: 200,
    Old_Hungarian: 201,
    Rumi_Numeral_Symbols: 202,
    Brahmi: 203,
    Kaithi: 204,
    Sora_Sompeng: 205,
    Chakma: 206,
    Mahajani: 207,
    Sharada: 208,
    Sinhala_Archaic_Numbers: 209,
    Khojki: 210,
    Multani: 211,
    Khudawadi: 212,
    Grantha: 213,
    Newa: 214,
    Tirhuta: 215,
    Siddham: 216,
    Modi: 217,
    Mongolian_Supplement: 218,
    Takri: 219,
    Ahom: 220,
    Warang_Citi: 221,
    Pau_Cin_Hau: 222,
    Bhaiksuki: 223,
    Marchen: 224,
    Cuneiform: 225,
    Cuneiform_Numbers_and_Punctuation: 226,
    Early_Dynastic_Cuneiform: 227,
    Egyptian_Hieroglyphs: 228,
    Anatolian_Hieroglyphs: 229,
    Bamum_Supplement: 230,
    Mro: 231,
    Bassa_Vah: 232,
    Pahawh_Hmong: 233,
    Miao: 234,
    Ideographic_Symbols_and_Punctuation: 235,
    Tangut: 236,
    Tangut_Components: 237,
    Kana_Supplement: 238,
    Duployan: 239,
    Shorthand_Format_Controls: 240,
    Byzantine_Musical_Symbols: 241,
    Musical_Symbols: 242,
    Ancient_Greek_Musical_Notation: 243,
    Tai_Xuan_Jing_Symbols: 244,
    Counting_Rod_Numerals: 245,
    Mathematical_Alphanumeric_Symbols: 246,
    Sutton_SignWriting: 247,
    Glagolitic_Supplement: 248,
    Mende_Kikakui: 249,
    Adlam: 250,
    Arabic_Mathematical_Alphabetic_Symbols: 251,
    Mahjong_Tiles: 252,
    Domino_Tiles: 253,
    Playing_Cards: 254,
    Enclosed_Alphanumeric_Supplement: 255,
    Enclosed_Ideographic_Supplement: 256,
    Miscellaneous_Symbols_and_Pictographs: 257,
    Emoticons: 258,
    Ornamental_Dingbats: 259,
    Transport_and_Map_Symbols: 260,
    Alchemical_Symbols: 261,
    Geometric_Shapes_Extended: 262,
    Supplemental_Arrows_C: 263,
    Supplemental_Symbols_and_Pictographs: 264,
    CJK_Unified_Ideographs_Extension_B: 265,
    CJK_Unified_Ideographs_Extension_C: 266,
    CJK_Unified_Ideographs_Extension_D: 267,
    CJK_Unified_Ideographs_Extension_E: 268,
    CJK_Compatibility_Ideographs_Supplement: 269,
    Tags: 270,
    Variation_Selectors_Supplement: 271,
    Supplementary_Private_Use_Area_A: 272,
    Supplementary_Private_Use_Area_B: 273,
  }

  /**
   * @enum {number}
   */
  const c_oCodePagesOS2_1 = {
    Latin_1: 0,
    Latin_2: 1,
    Cyrillic: 2,
    Greek: 3,
    Turkish: 4,
    Hebrew: 5,
    Arabic: 6,
    Windows_Baltic: 7,
    Vietnamese: 8,

    Thai: 16,
    JIS_Japan: 17,
    Chinese_Simplified: 18,
    Korean_Wansung: 19,
    Chinese_Traditional: 20,
    Korean_Johab: 21,

    Macintosh_Character_Set_US_Roman: 29,
    OEM_Character_Set: 30,
    Symbol_Character_Set: 31,
  }

  /**
   * @enum {number}
   */
  const c_oCodePagesOS2_2 = {
    IBM_Greek: 48 - 32,
    MS_DOS_Russian: 49 - 32,
    MS_DOS_Nordic: 50 - 32,
    Arabic: 51 - 32,
    MS_DOS_Canadian_French: 52 - 32,
    Hebrew: 53 - 32,
    MS_DOS_Icelandic: 54 - 32,
    MS_DOS_Portuguese: 55 - 32,
    IBM_Turkish: 56 - 32,
    IBM_Cyrillic: 57 - 32,
    Latin_2: 58 - 32,
    MS_DOS_Baltic: 59 - 32,
    Greek_437: 60 - 32,
    Arabic_708: 61 - 32,
    WE_Latin_1: 62 - 32,
    US: 63 - 32,
  }

  /**
   * @enum {number}
   */
  const c_oUnicodeRangeOS2_1 = {
    Basic_Latin: 0,
    Latin_1_Supplement: 1,
    Latin_Extended_A: 2,
    Latin_Extended_B: 3,
    IPA_Extensions: 4,
    Spacing_Modifier_Letters: 5,
    Combining_Diacritical_Marks: 6,
    Greek_and_Coptic: 7,
    Coptic: 8,
    Cyrillic: 9,
    Armenian: 10,
    Hebrew: 11,
    Vai: 12,
    Arabic: 13,
    NKo: 14,
    Devanagari: 15,
    Bengali: 16,
    Gurmukhi: 17,
    Gujarati: 18,
    Oriya: 19,
    Tamil: 20,
    Telugu: 21,
    Kannada: 22,
    Malayalam: 23,
    Thai: 24,
    Lao: 25,
    Georgian: 26,
    Balinese: 27,
    Hangul_Jamo: 28,
    Latin_Extended_Additional: 29,
    Greek_Extended: 30,
    General_Punctuation: 31,
  }

  /**
   * @enum {number}
   */
  const c_oUnicodeRangeOS2_2 = {
    Superscripts_And_Subscripts: 32 - 32,
    Currency_Symbols: 33 - 32,
    Combining_Diacritical_Marks_For_Symbols: 34 - 32,
    Letterlike_Symbols: 35 - 32,
    Number_Forms: 36 - 32,
    Arrows: 37 - 32,
    Mathematical_Operators: 38 - 32,
    Miscellaneous_Technical: 39 - 32,
    Control_Pictures: 40 - 32,
    Optical_Character_Recognition: 41 - 32,
    Enclosed_Alphanumerics: 42 - 32,
    Box_Drawing: 43 - 32,
    Block_Elements: 44 - 32,
    Geometric_Shapes: 45 - 32,
    Miscellaneous_Symbols: 46 - 32,
    Dingbats: 47 - 32,
    CJK_Symbols_And_Punctuation: 48 - 32,
    Hiragana: 49 - 32,
    Katakana: 50 - 32,
    Bopomofo: 51 - 32,
    Hangul_Compatibility_Jamo: 52 - 32,
    Phags_pa: 53 - 32,
    Enclosed_CJK_Letters_And_Months: 54 - 32,
    CJK_Compatibility: 55 - 32,
    Hangul_Syllables: 56 - 32,
    Non_Plane: 57 - 32,
    Phoenician: 58 - 32,
    CJK_Unified_Ideographs: 59 - 32,
    Private_Use_Area_plane_0: 60 - 32,
    CJK_Strokes: 61 - 32,
    Alphabetic_Presentation_Forms: 62 - 32,
    Arabic_Presentation_Forms_A: 63 - 32,
  }

  /**
   * @enum {number}
   */
  const c_oUnicodeRangeOS2_3 = {
    Combining_Half_Marks: 64 - 64,
    Vertical_Forms: 65 - 64,
    Small_Form_Variants: 66 - 64,
    Arabic_Presentation_Forms_B: 67 - 64,
    Halfwidth_And_Fullwidth_Forms: 68 - 64,
    Specials: 69 - 64,
    Tibetan: 70 - 64,
    Syriac: 71 - 64,
    Thaana: 72 - 64,
    Sinhala: 73 - 64,
    Myanmar: 74 - 64,
    Ethiopic: 75 - 64,
    Cherokee: 76 - 64,
    Unified_Canadian_Aboriginal_Syllabics: 77 - 64,
    Ogham: 78 - 64,
    Runic: 79 - 64,
    Khmer: 80 - 64,
    Mongolian: 81 - 64,
    Braille_Patterns: 82 - 64,
    Yi_Syllables: 83 - 64,
    Tagalog: 84 - 64,
    Old_Italic: 85 - 64,
    Gothic: 86 - 64,
    Deseret: 87 - 64,
    Byzantine_Musical_Symbols: 88 - 64,
    Mathematical_Alphanumeric_Symbols: 89 - 64,
    Private_Use_plane_15: 90 - 64,
    Variation_Selectors: 91 - 64,
    Tags: 92 - 64,
    Limbu: 93 - 64,
    Tai_Le: 94 - 64,
    New_Tai_Lue: 95 - 64,
  }

  /**
   * @enum {number}
   */
  const c_oUnicodeRangeOS2_4 = {
    Buginese: 96 - 96,
    Glagolitic: 97 - 96,
    Tifinagh: 98 - 96,
    Yijing_Hexagram_Symbols: 99 - 96,
    Syloti_Nagri: 100 - 96,
    Linear_B_Syllabary: 101 - 96,
    Ancient_Greek_Numbers: 102 - 96,
    Ugaritic: 103 - 96,
    Old_Persian: 104 - 96,
    Shavian: 105 - 96,
    Osmanya: 106 - 96,
    Cypriot_Syllabary: 107 - 96,
    Kharoshthi: 108 - 96,
    Tai_Xuan_Jing_Symbols: 109 - 96,
    Cuneiform: 110 - 96,
    Counting_Rod_Numerals: 111 - 96,
    Sundanese: 112 - 96,
    Lepcha: 113 - 96,
    Ol_Chiki: 114 - 96,
    Saurashtra: 115 - 96,
    Kayah_Li: 116 - 96,
    Rejang: 117 - 96,
    Cham: 118 - 96,
    Ancient_Symbols: 119 - 96,
    Phaistos_Disc: 120 - 96,
    Carian: 121 - 96,
    Domino_Tiles: 122 - 96,
  }

  /**
   * @param {_start} start range value
   * @param {_end} end range value
   * @param {_name} not used range name
   * @param {_lid} language id for ooxml format
   * @param {_picks} in os/2 font table: [ulUnicodeRange1, ulUnicodeRange2, ulUnicodeRange3, ulUnicodeRange4, ulCodePageRange1, ulCodePageRange2];
   */
  function CRange(_start, _end, _name, _lid, _picks) {
    this.Start = _start
    this.End = _end
    this.Name = _name
    this.Lid = _lid
    this.Param = _picks
  }

  const c_oUnicodeRanges = [
    new CRange(0x0020, 0x007e, c_oUnicodeRangesLID.Basic_Latin, lcid_enUS, [
      1 << c_oUnicodeRangeOS2_1.Basic_Latin,
      0,
      0,
      0,
      1 << c_oCodePagesOS2_1.Latin_1,
      0,
    ]),
    new CRange(0x00a0, 0x00ff, c_oUnicodeRangesLID.Latin_1_Supplement, lcid_unknown, [
      (1 << c_oUnicodeRangeOS2_1.Basic_Latin) | (1 << c_oUnicodeRangeOS2_1.Latin_1_Supplement),
      0,
      0,
      0,
      1 << c_oCodePagesOS2_1.Latin_1,
      0,
    ]),
    new CRange(0x0100, 0x017f, c_oUnicodeRangesLID.Latin_Extended_A, lcid_unknown, [
      (1 << c_oUnicodeRangeOS2_1.Basic_Latin) | (1 << c_oUnicodeRangeOS2_1.Latin_Extended_A),
      0,
      0,
      0,
      (1 << c_oCodePagesOS2_1.Latin_1) |
        (1 << c_oCodePagesOS2_1.Latin_2) |
        (1 << c_oCodePagesOS2_1.Turkish) |
        (1 << c_oCodePagesOS2_1.Windows_Baltic),
      0,
    ]),
    new CRange(0x0180, 0x024f, c_oUnicodeRangesLID.Latin_Extended_B, lcid_unknown, [
      (1 << c_oUnicodeRangeOS2_1.Basic_Latin) | (1 << c_oUnicodeRangeOS2_1.Latin_Extended_B),
      0,
      0,
      0,
      (1 << c_oCodePagesOS2_1.Latin_1) |
        (1 << c_oCodePagesOS2_1.Latin_2) |
        (1 << c_oCodePagesOS2_1.Turkish) |
        (1 << c_oCodePagesOS2_1.Windows_Baltic),
      0,
    ]),
    new CRange(0x0250, 0x02af, c_oUnicodeRangesLID.IPA_Extensions, lcid_unknown, [
      1 << c_oUnicodeRangeOS2_1.IPA_Extensions,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x02b0, 0x02ff, c_oUnicodeRangesLID.Spacing_Modifier_Letters, lcid_unknown, [
      1 << c_oUnicodeRangeOS2_1.Spacing_Modifier_Letters,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x0300, 0x036f, c_oUnicodeRangesLID.Combining_Diacritical_Marks, lcid_unknown, [
      1 << c_oUnicodeRangeOS2_1.Combining_Diacritical_Marks,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x0370, 0x03ff, c_oUnicodeRangesLID.Greek_and_Coptic, lcid_elGR, [
      1 << c_oUnicodeRangeOS2_1.Greek_and_Coptic,
      0,
      0,
      0,
      1 << c_oCodePagesOS2_1.Greek,
      0,
    ]),
    new CRange(0x0400, 0x04ff, c_oUnicodeRangesLID.Cyrillic, lcid_ruRU, [
      1 << c_oUnicodeRangeOS2_1.Cyrillic,
      0,
      0,
      0,
      1 << c_oCodePagesOS2_1.Cyrillic,
      0,
    ]),
    new CRange(0x0500, 0x052f, c_oUnicodeRangesLID.Cyrillic_Supplement, lcid_unknown, [
      1 << c_oUnicodeRangeOS2_1.Cyrillic,
      0,
      0,
      0,
      1 << c_oCodePagesOS2_1.Cyrillic,
      0,
    ]),
    new CRange(0x0530, 0x058f, c_oUnicodeRangesLID.Armenian, lcid_hyAM, [
      1 << c_oUnicodeRangeOS2_1.Armenian,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x0590, 0x05ff, c_oUnicodeRangesLID.Hebrew, lcid_heIL, [
      1 << c_oUnicodeRangeOS2_1.Hebrew,
      0,
      0,
      0,
      1 << c_oCodePagesOS2_1.Hebrew,
      1 << c_oCodePagesOS2_2.Hebrew,
    ]),
    new CRange(0x0600, 0x06ff, c_oUnicodeRangesLID.Arabic, lcid_ar, [
      1 << c_oUnicodeRangeOS2_1.Arabic,
      0,
      0,
      0,
      1 << c_oCodePagesOS2_1.Arabic,
      (1 << c_oCodePagesOS2_2.Arabic) | (1 << c_oCodePagesOS2_2.Arabic_708),
    ]),
    new CRange(0x0700, 0x074f, c_oUnicodeRangesLID.Syriac, lcid_syrSY, [
      1 << c_oUnicodeRangeOS2_1.Arabic,
      0,
      0,
      0,
      1 << c_oCodePagesOS2_1.Arabic,
      (1 << c_oCodePagesOS2_2.Arabic) | (1 << c_oCodePagesOS2_2.Arabic_708),
    ]),
    new CRange(0x0750, 0x077f, c_oUnicodeRangesLID.Arabic_Supplement, lcid_ar, [
      1 << c_oUnicodeRangeOS2_1.Arabic,
      0,
      0,
      0,
      1 << c_oCodePagesOS2_1.Arabic,
      (1 << c_oCodePagesOS2_2.Arabic) | (1 << c_oCodePagesOS2_2.Arabic_708),
    ]),
    new CRange(0x0780, 0x07bf, c_oUnicodeRangesLID.Thaana, lcid_dvMV, [
      1 << c_oUnicodeRangeOS2_1.Arabic,
      0,
      0,
      0,
      1 << c_oCodePagesOS2_1.Arabic,
      (1 << c_oCodePagesOS2_2.Arabic) | (1 << c_oCodePagesOS2_2.Arabic_708),
    ]),
    new CRange(0x07c0, 0x07ff, c_oUnicodeRangesLID.NKo, lcid_unknown, [
      1 << c_oUnicodeRangeOS2_1.NKo,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x0800, 0x083f, c_oUnicodeRangesLID.Samaritan, lcid_unknown, [
      1 << c_oUnicodeRangeOS2_1.Hebrew,
      0,
      0,
      0,
      1 << c_oCodePagesOS2_1.Hebrew,
      0,
    ]),
    new CRange(0x0840, 0x085f, c_oUnicodeRangesLID.Mandaic, lcid_unknown, [
      1 << c_oUnicodeRangeOS2_1.Arabic,
      0,
      0,
      0,
      1 << c_oCodePagesOS2_1.Arabic,
      (1 << c_oCodePagesOS2_2.Arabic) | (1 << c_oCodePagesOS2_2.Arabic_708),
    ]),
    new CRange(0x08a0, 0x08ff, c_oUnicodeRangesLID.Arabic_Extended_A, lcid_ar, [
      1 << c_oUnicodeRangeOS2_1.Arabic,
      0,
      0,
      0,
      1 << c_oCodePagesOS2_1.Arabic,
      (1 << c_oCodePagesOS2_2.Arabic) | (1 << c_oCodePagesOS2_2.Arabic_708),
    ]),
    new CRange(0x0900, 0x097f, c_oUnicodeRangesLID.Devanagari, lcid_hiIN, [
      1 << c_oUnicodeRangeOS2_1.Devanagari,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x0980, 0x09ff, c_oUnicodeRangesLID.Bengali, lcid_bnIN, [
      1 << c_oUnicodeRangeOS2_1.Bengali,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x0a00, 0x0a7f, c_oUnicodeRangesLID.Gurmukhi, lcid_paIN, [
      1 << c_oUnicodeRangeOS2_1.Gurmukhi,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x0a80, 0x0aff, c_oUnicodeRangesLID.Gujarati, lcid_guIN, [
      1 << c_oUnicodeRangeOS2_1.Gujarati,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x0b00, 0x0b7f, c_oUnicodeRangesLID.Oriya, lcid_orIN, [
      1 << c_oUnicodeRangeOS2_1.Oriya,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x0b80, 0x0bff, c_oUnicodeRangesLID.Tamil, lcid_taIN, [
      1 << c_oUnicodeRangeOS2_1.Tamil,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x0c00, 0x0c7f, c_oUnicodeRangesLID.Telugu, lcid_teIN, [
      1 << c_oUnicodeRangeOS2_1.Telugu,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x0c80, 0x0cff, c_oUnicodeRangesLID.Kannada, lcid_knIN, [
      1 << c_oUnicodeRangeOS2_1.Kannada,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x0d00, 0x0d7f, c_oUnicodeRangesLID.Malayalam, lcid_mlIN, [
      1 << c_oUnicodeRangeOS2_1.Malayalam,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x0d80, 0x0dff, c_oUnicodeRangesLID.Sinhala, lcid_siLK, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Sinhala,
      0,
      0,
      0,
    ]),
    new CRange(0x0e00, 0x0e7f, c_oUnicodeRangesLID.Thai, lcid_thTH, [
      1 << c_oUnicodeRangeOS2_1.Thai,
      0,
      0,
      0,
      1 << c_oCodePagesOS2_1.Thai,
      0,
    ]),
    new CRange(0x0e80, 0x0eff, c_oUnicodeRangesLID.Lao, lcid_loLA, [
      1 << c_oUnicodeRangeOS2_1.Lao,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x0f00, 0x0fff, c_oUnicodeRangesLID.Tibetan, lcid_boBT, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Tibetan,
      0,
      0,
      0,
    ]),
    new CRange(0x1000, 0x109f, c_oUnicodeRangesLID.Myanmar, lcid_myMM, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Myanmar,
      0,
      0,
      0,
    ]),
    new CRange(0x10a0, 0x10ff, c_oUnicodeRangesLID.Georgian, lcid_kaGE, [
      1 << c_oUnicodeRangeOS2_1.Georgian,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x1100, 0x11ff, c_oUnicodeRangesLID.Hangul_Jamo, lcid_koKR, [
      1 << c_oUnicodeRangeOS2_1.Hangul_Jamo,
      0,
      0,
      0,
      1 << c_oCodePagesOS2_1.Korean_Wansung,
      0,
    ]),
    new CRange(0x1200, 0x137f, c_oUnicodeRangesLID.Ethiopic, lcid_gazET, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Ethiopic,
      0,
      0,
      0,
    ]),
    new CRange(0x1380, 0x139f, c_oUnicodeRangesLID.Ethiopic_Supplement, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Ethiopic,
      0,
      0,
      0,
    ]),
    new CRange(0x13a0, 0x13ff, c_oUnicodeRangesLID.Cherokee, lcid_chrUS, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Cherokee,
      0,
      0,
      0,
    ]),
    new CRange(
      0x1400,
      0x167f,
      c_oUnicodeRangesLID.Unified_Canadian_Aboriginal_Syllabics,
      lcid_iuCansCA,
      [0, 0, 1 << c_oUnicodeRangeOS2_3.Unified_Canadian_Aboriginal_Syllabics, 0, 0, 0],
    ),
    new CRange(0x1680, 0x169f, c_oUnicodeRangesLID.Ogham, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Ogham,
      0,
      0,
      0,
    ]),
    new CRange(0x16a0, 0x16ff, c_oUnicodeRangesLID.Runic, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Runic,
      0,
      0,
      0,
    ]),
    new CRange(0x1700, 0x171f, c_oUnicodeRangesLID.Tagalog, lcid_filPH, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Tagalog,
      0,
      0,
      0,
    ]),
    new CRange(0x1720, 0x173f, c_oUnicodeRangesLID.Hanunoo, lcid_filPH, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Tagalog,
      0,
      0,
      0,
    ]),
    new CRange(0x1740, 0x175f, c_oUnicodeRangesLID.Buhid, lcid_filPH, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Tagalog,
      0,
      0,
      0,
    ]),
    new CRange(0x1760, 0x177f, c_oUnicodeRangesLID.Tagbanwa, lcid_filPH, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Tagalog,
      0,
      0,
      0,
    ]),
    new CRange(0x1780, 0x17ff, c_oUnicodeRangesLID.Khmer, lcid_kmKH, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Khmer,
      0,
      0,
      0,
    ]),
    new CRange(0x1800, 0x18af, c_oUnicodeRangesLID.Mongolian, lcid_mnMN, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Mongolian,
      0,
      0,
      0,
    ]),
    new CRange(
      0x18b0,
      0x18ff,
      c_oUnicodeRangesLID.Unified_Canadian_Aboriginal_Syllabics_Extended,
      lcid_iuCansCA,
      [0, 0, 1 << c_oUnicodeRangeOS2_3.Unified_Canadian_Aboriginal_Syllabics, 0, 0, 0],
    ),
    new CRange(0x1900, 0x194f, c_oUnicodeRangesLID.Limbu, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Limbu,
      0,
      0,
      0,
    ]),
    new CRange(0x1950, 0x197f, c_oUnicodeRangesLID.Tai_Le, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Tai_Le,
      0,
      0,
      0,
    ]),
    new CRange(0x1980, 0x19df, c_oUnicodeRangesLID.New_Tai_Lue, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.New_Tai_Lue,
      0,
      0,
      0,
    ]),
    new CRange(0x19e0, 0x19ff, c_oUnicodeRangesLID.Khmer_Symbols, lcid_kmKH, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Khmer,
      0,
      0,
      0,
    ]),
    new CRange(0x1a00, 0x1a1f, c_oUnicodeRangesLID.Buginese, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Buginese,
      0,
      0,
      0,
    ]),
    new CRange(0x1a20, 0x1aaf, c_oUnicodeRangesLID.Tai_Tham, lcid_thTH, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Tai_Le,
      0,
      0,
      0,
    ]),
    new CRange(
      0x1ab0,
      0x1aff,
      c_oUnicodeRangesLID.Combining_Diacritical_Marks_Extended,
      lcid_unknown,
      [1 << c_oUnicodeRangeOS2_1.Combining_Diacritical_Marks, 0, 0, 0, 0, 0],
    ),
    new CRange(0x1b00, 0x1b7f, c_oUnicodeRangesLID.Balinese, lcid_idID, [
      1 << c_oUnicodeRangeOS2_1.Balinese,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x1b80, 0x1bbf, c_oUnicodeRangesLID.Sundanese, lcid_idID, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Sundanese,
      0,
      0,
    ]),
    new CRange(0x1bc0, 0x1bff, c_oUnicodeRangesLID.Batak, lcid_idID, []),
    new CRange(0x1c00, 0x1c4f, c_oUnicodeRangesLID.Lepcha, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Lepcha,
      0,
      0,
    ]),
    new CRange(0x1c50, 0x1c7f, c_oUnicodeRangesLID.Ol_Chiki, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Ol_Chiki,
      0,
      0,
    ]),
    new CRange(0x1c80, 0x1c8f, c_oUnicodeRangesLID.Cyrillic_Extended_C, lcid_unknown, [
      1 << c_oUnicodeRangeOS2_1.Cyrillic,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x1cc0, 0x1ccf, c_oUnicodeRangesLID.Sundanese_Supplement, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Sundanese,
      0,
      0,
    ]),
    new CRange(0x1cd0, 0x1cff, c_oUnicodeRangesLID.Vedic_Extensions, lcid_unknown, []),
    new CRange(0x1d00, 0x1d7f, c_oUnicodeRangesLID.Phonetic_Extensions, lcid_unknown, [
      1 << c_oUnicodeRangeOS2_1.IPA_Extensions,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x1d80, 0x1dbf, c_oUnicodeRangesLID.Phonetic_Extensions_Supplement, lcid_unknown, [
      1 << c_oUnicodeRangeOS2_1.IPA_Extensions,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(
      0x1dc0,
      0x1dff,
      c_oUnicodeRangesLID.Combining_Diacritical_Marks_Supplement,
      lcid_unknown,
      [1 << c_oUnicodeRangeOS2_1.Combining_Diacritical_Marks, 0, 0, 0, 0, 0],
    ),
    new CRange(0x1e00, 0x1eff, c_oUnicodeRangesLID.Latin_Extended_Additional, lcid_unknown, [
      1 << c_oUnicodeRangeOS2_1.Latin_Extended_Additional,
      0,
      0,
      0,
      1 << c_oCodePagesOS2_1.Vietnamese,
      0,
    ]),
    new CRange(0x1f00, 0x1fff, c_oUnicodeRangesLID.Greek_Extended, lcid_unknown, [
      1 << c_oUnicodeRangeOS2_1.Greek_Extended,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x2000, 0x206f, c_oUnicodeRangesLID.General_Punctuation, lcid_unknown, [
      1 << c_oUnicodeRangeOS2_1.Punctuation,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x2070, 0x209f, c_oUnicodeRangesLID.Superscripts_and_Subscripts, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Superscripts_And_Subscripts,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x20a0, 0x20cf, c_oUnicodeRangesLID.Currency_Symbols, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Currency_Symbols,
      0,
      0,
      0,
      0,
    ]),
    new CRange(
      0x20d0,
      0x20ff,
      c_oUnicodeRangesLID.Combining_Diacritical_Marks_for_Symbols,
      lcid_unknown,
      [0, 1 << c_oUnicodeRangeOS2_2.Combining_Diacritical_Marks_For_Symbols, 0, 0, 0, 0],
    ),
    new CRange(0x2100, 0x214f, c_oUnicodeRangesLID.Letterlike_Symbols, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Letterlike_Symbols,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x2150, 0x218f, c_oUnicodeRangesLID.Number_Forms, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Number_Forms,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x2190, 0x21ff, c_oUnicodeRangesLID.Arrows, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Arrows,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x2200, 0x22ff, c_oUnicodeRangesLID.Mathematical_Operators, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Mathematical_Operators,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x2300, 0x23ff, c_oUnicodeRangesLID.Miscellaneous_Technical, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Miscellaneous_Technical,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x2400, 0x243f, c_oUnicodeRangesLID.Control_Pictures, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Control_Pictures,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x2440, 0x245f, c_oUnicodeRangesLID.Optical_Character_Recognition, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Optical_Character_Recognition,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x2460, 0x24ff, c_oUnicodeRangesLID.Enclosed_Alphanumerics, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Enclosed_Alphanumerics,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x2500, 0x257f, c_oUnicodeRangesLID.Box_Drawing, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Box_Drawing,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x2580, 0x259f, c_oUnicodeRangesLID.Block_Elements, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Block_Elements,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x25a0, 0x25ff, c_oUnicodeRangesLID.Geometric_Shapes, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Geometric_Shapes,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x2600, 0x26ff, c_oUnicodeRangesLID.Miscellaneous_Symbols, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Miscellaneous_Symbols,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x2700, 0x27bf, c_oUnicodeRangesLID.Dingbats, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Dingbats,
      0,
      0,
      0,
      0,
    ]),
    new CRange(
      0x27c0,
      0x27ef,
      c_oUnicodeRangesLID.Miscellaneous_Mathematical_Symbols_A,
      lcid_unknown,
      [0, 1 << c_oUnicodeRangeOS2_2.Mathematical_Operators, 0, 0, 0, 0],
    ),
    new CRange(0x27f0, 0x27ff, c_oUnicodeRangesLID.Supplemental_Arrows_A, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Arrows,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x2800, 0x28ff, c_oUnicodeRangesLID.Braille_Patterns, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Braille_Patterns,
      0,
      0,
      0,
    ]),
    new CRange(0x2900, 0x297f, c_oUnicodeRangesLID.Supplemental_Arrows_B, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Arrows,
      0,
      0,
      0,
      0,
    ]),
    new CRange(
      0x2980,
      0x29ff,
      c_oUnicodeRangesLID.Miscellaneous_Mathematical_Symbols_B,
      lcid_unknown,
      [0, 1 << c_oUnicodeRangeOS2_2.Mathematical_Operators, 0, 0, 0, 0],
    ),
    new CRange(
      0x2a00,
      0x2aff,
      c_oUnicodeRangesLID.Supplemental_Mathematical_Operators,
      lcid_unknown,
      [0, 1 << c_oUnicodeRangeOS2_2.Mathematical_Operators, 0, 0, 0, 0],
    ),
    new CRange(0x2b00, 0x2bff, c_oUnicodeRangesLID.Miscellaneous_Symbols_and_Arrows, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Arrows,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x2c00, 0x2c5f, c_oUnicodeRangesLID.Glagolitic, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_2.Glagolitic,
      0,
      0,
    ]),
    new CRange(0x2c60, 0x2c7f, c_oUnicodeRangesLID.Latin_Extended_C, lcid_unknown, [
      1 << c_oUnicodeRangeOS2_1.Latin_Extended_Additional,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x2c80, 0x2cff, c_oUnicodeRangesLID.Coptic, lcid_unknown, [
      1 << c_oUnicodeRangeOS2_1.Coptic,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x2d00, 0x2d2f, c_oUnicodeRangesLID.Georgian_Supplement, lcid_unknown, [
      1 << c_oUnicodeRangeOS2_1.Georgian,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x2d30, 0x2d7f, c_oUnicodeRangesLID.Tifinagh, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Tifinagh,
      0,
      0,
    ]),
    new CRange(0x2d80, 0x2ddf, c_oUnicodeRangesLID.Ethiopic_Extended, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Ethiopic,
      0,
      0,
      0,
    ]),
    new CRange(0x2de0, 0x2dff, c_oUnicodeRangesLID.Cyrillic_Extended_A, lcid_unknown, [
      1 << c_oUnicodeRangeOS2_1.Cyrillic,
      0,
      0,
      0,
      1 << c_oCodePagesOS2_1.Cyrillic,
      0,
    ]),
    new CRange(0x2e00, 0x2e7f, c_oUnicodeRangesLID.Supplemental_Punctuation, lcid_unknown, [
      1 << c_oUnicodeRangeOS2_1.General_Punctuation,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x2e80, 0x2eff, c_oUnicodeRangesLID.CJK_Radicals_Supplement, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.CJK_Unified_Ideographs,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x2f00, 0x2fdf, c_oUnicodeRangesLID.Kangxi_Radicals, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.CJK_Unified_Ideographs,
      0,
      0,
      0,
      0,
    ]),
    new CRange(
      0x2ff0,
      0x2fff,
      c_oUnicodeRangesLID.Ideographic_Description_Characters,
      lcid_unknown,
      [0, 1 << c_oUnicodeRangeOS2_2.CJK_Unified_Ideographs, 0, 0, 0, 0],
    ),
    new CRange(0x3000, 0x303f, c_oUnicodeRangesLID.CJK_Symbols_and_Punctuation, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.CJK_Symbols_And_Punctuation,
      0,
      0,
      (1 << c_oCodePagesOS2_1.JIS_Japan) | (1 << c_oCodePagesOS2_1.OEM_Character_Set),
      0,
    ]),
    new CRange(0x3040, 0x309f, c_oUnicodeRangesLID.Hiragana, lcid_jaJP, [
      0,
      1 << c_oUnicodeRangeOS2_2.Hiragana,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x30a0, 0x30ff, c_oUnicodeRangesLID.Katakana, lcid_jaJP, [
      0,
      1 << c_oUnicodeRangeOS2_2.Katakana,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x3100, 0x312f, c_oUnicodeRangesLID.Bopomofo, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Bopomofo,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x3130, 0x318f, c_oUnicodeRangesLID.Hangul_Compatibility_Jamo, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Hangul_Compatibility_Jamo,
      0,
      0,
      1 << c_oCodePagesOS2_1.Korean_Wansung,
      0,
    ]),
    new CRange(0x3190, 0x319f, c_oUnicodeRangesLID.Kanbun, lcid_zhCN, [
      0,
      1 << c_oUnicodeRangeOS2_2.CJK_Unified_Ideographs,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x31a0, 0x31bf, c_oUnicodeRangesLID.Bopomofo_Extended, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Bopomofo,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x31c0, 0x31ef, c_oUnicodeRangesLID.CJK_Strokes, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.CJK_Strokes,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x31f0, 0x31ff, c_oUnicodeRangesLID.Katakana_Phonetic_Extensions, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Katakana,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x3200, 0x32ff, c_oUnicodeRangesLID.Enclosed_CJK_Letters_and_Months, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Enclosed_CJK_Letters_And_Months,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x3300, 0x33ff, c_oUnicodeRangesLID.CJK_Compatibility, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.CJK_Compatibility,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x3400, 0x4dbf, c_oUnicodeRangesLID.CJK_Unified_Ideographs_Extension, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.CJK_Unified_Ideographs,
      0,
      0,
      (1 << c_oCodePagesOS2_1.Chinese_Simplified) | (1 << c_oCodePagesOS2_1.Chinese_Traditional),
      0,
    ]),
    new CRange(0x4dc0, 0x4dff, c_oUnicodeRangesLID.Yijing_Hexagram_Symbols, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Yijing_Hexagram_Symbols,
      (1 << c_oCodePagesOS2_1.Chinese_Simplified) | (1 << c_oCodePagesOS2_1.Chinese_Traditional),
      0,
    ]),
    new CRange(0x4e00, 0x9fff, c_oUnicodeRangesLID.CJK_Unified_Ideographs, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.CJK_Unified_Ideographs,
      0,
      0,
      (1 << c_oCodePagesOS2_1.Chinese_Simplified) |
        (1 << c_oCodePagesOS2_1.Chinese_Traditional) |
        (1 << c_oCodePagesOS2_1.JIS_Japan) |
        (1 << c_oCodePagesOS2_1.OEM_Character_Set),
      0,
    ]),
    new CRange(0xa000, 0xa48f, c_oUnicodeRangesLID.Yi_Syllables, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Yi_Syllables,
      0,
      0,
      0,
    ]),
    new CRange(0xa490, 0xa4cf, c_oUnicodeRangesLID.Yi_Radicals, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Yi_Radicals,
      0,
      0,
      0,
    ]),
    new CRange(0xa4d0, 0xa4ff, c_oUnicodeRangesLID.Lisu, lcid_unknown, []),
    new CRange(0xa500, 0xa63f, c_oUnicodeRangesLID.Vai, lcid_unknown, [
      1 << c_oUnicodeRangeOS2_1.Vai,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0xa640, 0xa69f, c_oUnicodeRangesLID.Cyrillic_Extended_B, lcid_unknown, [
      1 << c_oUnicodeRangeOS2_1.Cyrillic,
      0,
      0,
      0,
      1 << c_oCodePagesOS2_1.Cyrillic,
      0,
    ]),
    new CRange(0xa6a0, 0xa6ff, c_oUnicodeRangesLID.Bamum, lcid_unknown, []),
    new CRange(0xa700, 0xa71f, c_oUnicodeRangesLID.Modifier_Tone_Letters, lcid_unknown, [
      1 << c_oUnicodeRangeOS2_1.Spacing_Modifier_Letters,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0xa720, 0xa7ff, c_oUnicodeRangesLID.Latin_Extended_D, lcid_unknown, [
      1 << c_oUnicodeRangeOS2_1.Latin_Extended_Additional,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0xa800, 0xa82f, c_oUnicodeRangesLID.Syloti_Nagri, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Syloti_Nagri,
      0,
      0,
    ]),
    new CRange(0xa830, 0xa83f, c_oUnicodeRangesLID.Common_Indic_Number_Forms, lcid_unknown, []),
    new CRange(0xa840, 0xa87f, c_oUnicodeRangesLID.Phags_pa, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Phags_pa,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0xa880, 0xa8df, c_oUnicodeRangesLID.Saurashtra, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Saurashtra,
      0,
      0,
    ]),
    new CRange(0xa8e0, 0xa8ff, c_oUnicodeRangesLID.Devanagari_Extended, lcid_unknown, [
      1 << c_oUnicodeRangeOS2_1.Devanagari,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0xa900, 0xa92f, c_oUnicodeRangesLID.Kayah_Li, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Kayah_Li,
      0,
      0,
    ]),
    new CRange(0xa930, 0xa95f, c_oUnicodeRangesLID.Rejang, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Rejang,
      0,
      0,
    ]),
    new CRange(0xa960, 0xa97f, c_oUnicodeRangesLID.Hangul_Jamo_Extended_A, lcid_unknown, [
      1 << c_oUnicodeRangeOS2_1.Hangul_Jamo,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0xa980, 0xa9df, c_oUnicodeRangesLID.Javanese, lcid_idID, []),
    new CRange(0xa9e0, 0xa9ff, c_oUnicodeRangesLID.Myanmar_Extended_B, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Myanmar,
      0,
      0,
      0,
    ]),
    new CRange(0xaa00, 0xaa5f, c_oUnicodeRangesLID.Cham, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Cham,
      0,
      0,
    ]),
    new CRange(0xaa60, 0xaa7f, c_oUnicodeRangesLID.Myanmar_Extended_A, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Myanmar,
      0,
      0,
      0,
    ]),
    new CRange(0xaa80, 0xaadf, c_oUnicodeRangesLID.Tai_Viet, lcid_unknown, []),
    new CRange(0xaae0, 0xaaff, c_oUnicodeRangesLID.Meetei_Mayek_Extensions, lcid_unknown, []),
    new CRange(0xab00, 0xab2f, c_oUnicodeRangesLID.Ethiopic_Extended_A, lcid_unknown, []),
    new CRange(0xab30, 0xab6f, c_oUnicodeRangesLID.Latin_Extended_E, lcid_unknown, [
      1 << c_oUnicodeRangeOS2_1.Latin_Extended_Additional,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0xab70, 0xabbf, c_oUnicodeRangesLID.Cherokee_Supplement, lcid_unknown, []),
    new CRange(0xabc0, 0xabff, c_oUnicodeRangesLID.Meetei_Mayek, lcid_unknown, []),
    new CRange(0xac00, 0xd7af, c_oUnicodeRangesLID.Hangul_Syllables, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Hangul_Syllables,
      0,
      0,
      1 << c_oCodePagesOS2_1.Korean_Wansung,
      0,
    ]),
    new CRange(0xd7b0, 0xd7ff, c_oUnicodeRangesLID.Hangul_Jamo_Extended_B, lcid_unknown, [
      1 << c_oUnicodeRangeOS2_1.Hangul_Jamo,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0xd800, 0xdb7f, c_oUnicodeRangesLID.High_Surrogates, lcid_unknown, []),
    new CRange(0xdb80, 0xdbff, c_oUnicodeRangesLID.High_Private_Use_Surrogates, lcid_unknown, []),
    new CRange(0xdc00, 0xdfff, c_oUnicodeRangesLID.Low_Surrogates, lcid_unknown, []),
    new CRange(0xe000, 0xf8ff, c_oUnicodeRangesLID.Private_Use_Area, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Private_Use_Area_plane_0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0xf900, 0xfaff, c_oUnicodeRangesLID.CJK_Compatibility_Ideographs, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.CJK_Compatibility_Ideographs,
      0,
      0,
      (1 << c_oCodePagesOS2_1.Chinese_Simplified) | (1 << c_oCodePagesOS2_1.Chinese_Traditional),
      0,
    ]),
    new CRange(0xfb00, 0xfb4f, c_oUnicodeRangesLID.Alphabetic_Presentation_Forms, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Alphabetic_Presentation_Forms,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0xfb50, 0xfdff, c_oUnicodeRangesLID.Arabic_Presentation_Forms_A, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Arabic_Presentation_Forms_A,
      0,
      0,
      1 << c_oCodePagesOS2_1.Arabic,
      (1 << c_oCodePagesOS2_2.Arabic) | (1 << c_oCodePagesOS2_2.Arabic_708),
    ]),
    new CRange(0xfe00, 0xfe0f, c_oUnicodeRangesLID.Variation_Selectors, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Variation_Selectors,
      0,
      0,
      0,
    ]),
    new CRange(0xfe10, 0xfe1f, c_oUnicodeRangesLID.Vertical_Forms, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Vertical_Forms,
      0,
      0,
      0,
    ]),
    new CRange(0xfe20, 0xfe2f, c_oUnicodeRangesLID.Combining_Half_Marks, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Combining_Half_Marks,
      0,
      0,
      0,
    ]),
    new CRange(0xfe30, 0xfe4f, c_oUnicodeRangesLID.CJK_Compatibility_Forms, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Vertical_Forms,
      0,
      0,
      0,
    ]),
    new CRange(0xfe50, 0xfe6f, c_oUnicodeRangesLID.Small_Form_Variants, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Small_Form_Variants,
      0,
      0,
      0,
    ]),
    new CRange(0xfe70, 0xfeff, c_oUnicodeRangesLID.Arabic_Presentation_Forms_B, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Arabic_Presentation_Forms_B,
      0,
      1 << c_oCodePagesOS2_1.Arabic,
      (1 << c_oCodePagesOS2_2.Arabic) | (1 << c_oCodePagesOS2_2.Arabic_708),
    ]),
    new CRange(0xff00, 0xffef, c_oUnicodeRangesLID.Halfwidth_and_Fullwidth_Forms, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Halfwidth_And_Fullwidth_Forms,
      0,
      (1 << c_oCodePagesOS2_1.Korean_Wansung) |
        (1 << c_oCodePagesOS2_1.Chinese_Simplified) |
        (1 << c_oCodePagesOS2_1.Chinese_Traditional) |
        (1 << c_oCodePagesOS2_1.JIS_Japan) |
        (1 << c_oCodePagesOS2_1.OEM_Character_Set),
      0,
    ]),
    new CRange(0xfff0, 0xffff, c_oUnicodeRangesLID.Specials, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Specials,
      0,
      0,
      0,
    ]),
    new CRange(0x10000, 0x1007f, c_oUnicodeRangesLID.Linear_B_Syllabary, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Linear_B_Syllabary,
      0,
      0,
    ]),
    new CRange(0x10080, 0x100ff, c_oUnicodeRangesLID.Linear_B_Ideograms, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Linear_B_Syllabary,
      0,
      0,
    ]),
    new CRange(0x10100, 0x1013f, c_oUnicodeRangesLID.Aegean_Numbers, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Linear_B_Syllabary,
      0,
      0,
    ]),
    new CRange(0x10140, 0x1018f, c_oUnicodeRangesLID.Ancient_Greek_Numbers, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Ancient_Greek_Numbers,
      0,
      0,
    ]),
    new CRange(0x10190, 0x101cf, c_oUnicodeRangesLID.Ancient_Symbols, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Ancient_Symbols,
      0,
      0,
    ]),
    new CRange(0x101d0, 0x101ff, c_oUnicodeRangesLID.Phaistos_Disc, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Phaistos_Disc,
      0,
      0,
    ]),
    new CRange(0x10280, 0x1029f, c_oUnicodeRangesLID.Lycian, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Carian,
      0,
      0,
    ]),
    new CRange(0x102a0, 0x102df, c_oUnicodeRangesLID.Carian, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Carian,
      0,
      0,
    ]),
    new CRange(0x102e0, 0x102ff, c_oUnicodeRangesLID.Coptic_Epact_Numbers, lcid_unknown, [
      1 << c_oUnicodeRangeOS2_1.Coptic,
      0,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x10300, 0x1032f, c_oUnicodeRangesLID.Old_Italic, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Old_Italic,
      0,
      0,
      0,
    ]),
    new CRange(0x10330, 0x1034f, c_oUnicodeRangesLID.Gothic, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Gothic,
      0,
      0,
      0,
    ]),
    new CRange(0x10350, 0x1037f, c_oUnicodeRangesLID.Old_Permic, lcid_unknown, []),
    new CRange(0x10380, 0x1039f, c_oUnicodeRangesLID.Ugaritic, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Ugaritic,
      0,
      0,
    ]),
    new CRange(0x103a0, 0x103df, c_oUnicodeRangesLID.Old_Persian, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Old_Persian,
      0,
      0,
    ]),
    new CRange(0x10400, 0x1044f, c_oUnicodeRangesLID.Deseret, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Deseret,
      0,
      0,
      0,
    ]),
    new CRange(0x10450, 0x1047f, c_oUnicodeRangesLID.Shavian, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Shavian,
      0,
      0,
    ]),
    new CRange(0x10480, 0x104af, c_oUnicodeRangesLID.Osmanya, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Osmanya,
      0,
      0,
    ]),
    new CRange(0x104b0, 0x104ff, c_oUnicodeRangesLID.Osage, lcid_unknown, []),
    new CRange(0x10500, 0x1052f, c_oUnicodeRangesLID.Elbasan, lcid_unknown, []),
    new CRange(0x10530, 0x1056f, c_oUnicodeRangesLID.Caucasian_Albanian, lcid_unknown, []),
    new CRange(0x10600, 0x1077f, c_oUnicodeRangesLID.Linear_A, lcid_unknown, []),
    new CRange(0x10800, 0x1083f, c_oUnicodeRangesLID.Cypriot_Syllabary, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Cypriot_Syllabary,
      0,
      0,
    ]),
    new CRange(0x10840, 0x1085f, c_oUnicodeRangesLID.Imperial_Aramaic, lcid_unknown, []),
    new CRange(0x10860, 0x1087f, c_oUnicodeRangesLID.Palmyrene, lcid_unknown, []),
    new CRange(0x10880, 0x108af, c_oUnicodeRangesLID.Nabataean, lcid_unknown, []),
    new CRange(0x108e0, 0x108ff, c_oUnicodeRangesLID.Hatran, lcid_unknown, []),
    new CRange(0x10900, 0x1091f, c_oUnicodeRangesLID.Phoenician, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Phoenician,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x10920, 0x1093f, c_oUnicodeRangesLID.Lydian, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Carian,
      0,
      0,
    ]),
    new CRange(0x10980, 0x1099f, c_oUnicodeRangesLID.Meroitic_Hieroglyphs, lcid_unknown, []),
    new CRange(0x109a0, 0x109ff, c_oUnicodeRangesLID.Meroitic_Cursive, lcid_unknown, []),
    new CRange(0x10a00, 0x10a5f, c_oUnicodeRangesLID.Kharoshthi, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Kharoshthi,
      0,
      0,
    ]),
    new CRange(0x10a60, 0x10a7f, c_oUnicodeRangesLID.Old_South_Arabian, lcid_unknown, []),
    new CRange(0x10a80, 0x10a9f, c_oUnicodeRangesLID.Old_North_Arabian, lcid_unknown, []),
    new CRange(0x10ac0, 0x10aff, c_oUnicodeRangesLID.Manichaean, lcid_unknown, []),
    new CRange(0x10b00, 0x10b3f, c_oUnicodeRangesLID.Avestan, lcid_unknown, []),
    new CRange(0x10b40, 0x10b5f, c_oUnicodeRangesLID.Inscriptional_Parthian, lcid_unknown, []),
    new CRange(0x10b60, 0x10b7f, c_oUnicodeRangesLID.Inscriptional_Pahlavi, lcid_unknown, []),
    new CRange(0x10b80, 0x10baf, c_oUnicodeRangesLID.Psalter_Pahlavi, lcid_unknown, []),
    new CRange(0x10c00, 0x10c4f, c_oUnicodeRangesLID.Old_Turkic, lcid_unknown, []),
    new CRange(0x10c80, 0x10cff, c_oUnicodeRangesLID.Old_Hungarian, lcid_unknown, []),
    new CRange(0x10e60, 0x10e7f, c_oUnicodeRangesLID.Rumi_Numeral_Symbols, lcid_unknown, []),
    new CRange(0x11000, 0x1107f, c_oUnicodeRangesLID.Brahmi, lcid_unknown, []),
    new CRange(0x11080, 0x110cf, c_oUnicodeRangesLID.Kaithi, lcid_unknown, []),
    new CRange(0x110d0, 0x110ff, c_oUnicodeRangesLID.Sora_Sompeng, lcid_unknown, []),
    new CRange(0x11100, 0x1114f, c_oUnicodeRangesLID.Chakma, lcid_unknown, []),
    new CRange(0x11150, 0x1117f, c_oUnicodeRangesLID.Mahajani, lcid_unknown, []),
    new CRange(0x11180, 0x111df, c_oUnicodeRangesLID.Sharada, lcid_unknown, []),
    new CRange(0x111e0, 0x111ff, c_oUnicodeRangesLID.Sinhala_Archaic_Numbers, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Sinhala,
      0,
      0,
      0,
    ]),
    new CRange(0x11200, 0x1124f, c_oUnicodeRangesLID.Khojki, lcid_unknown, []),
    new CRange(0x11280, 0x112af, c_oUnicodeRangesLID.Multani, lcid_unknown, []),
    new CRange(0x112b0, 0x112ff, c_oUnicodeRangesLID.Khudawadi, lcid_unknown, []),
    new CRange(0x11300, 0x1137f, c_oUnicodeRangesLID.Grantha, lcid_unknown, []),
    new CRange(0x11400, 0x1147f, c_oUnicodeRangesLID.Newa, lcid_unknown, []),
    new CRange(0x11480, 0x114df, c_oUnicodeRangesLID.Tirhuta, lcid_unknown, []),
    new CRange(0x11580, 0x115ff, c_oUnicodeRangesLID.Siddham, lcid_unknown, []),
    new CRange(0x11600, 0x1165f, c_oUnicodeRangesLID.Modi, lcid_unknown, []),
    new CRange(0x11660, 0x1167f, c_oUnicodeRangesLID.Mongolian_Supplement, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Mongolian,
      0,
      0,
      0,
    ]),
    new CRange(0x11680, 0x116cf, c_oUnicodeRangesLID.Takri, lcid_unknown, []),
    new CRange(0x11700, 0x1173f, c_oUnicodeRangesLID.Ahom, lcid_unknown, []),
    new CRange(0x118a0, 0x118ff, c_oUnicodeRangesLID.Warang_Citi, lcid_unknown, []),
    new CRange(0x11ac0, 0x11aff, c_oUnicodeRangesLID.Pau_Cin_Hau, lcid_unknown, []),
    new CRange(0x11c00, 0x11c6f, c_oUnicodeRangesLID.Bhaiksuki, lcid_unknown, []),
    new CRange(0x11c70, 0x11cbf, c_oUnicodeRangesLID.Marchen, lcid_unknown, []),
    new CRange(0x12000, 0x123ff, c_oUnicodeRangesLID.Cuneiform, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Cuneiform,
      0,
      0,
    ]),
    new CRange(
      0x12400,
      0x1247f,
      c_oUnicodeRangesLID.Cuneiform_Numbers_and_Punctuation,
      lcid_unknown,
      [0, 0, 0, 1 << c_oUnicodeRangeOS2_4.Cuneiform, 0, 0],
    ),
    new CRange(0x12480, 0x1254f, c_oUnicodeRangesLID.Early_Dynastic_Cuneiform, lcid_unknown, []),
    new CRange(0x13000, 0x1342f, c_oUnicodeRangesLID.Egyptian_Hieroglyphs, lcid_unknown, []),
    new CRange(0x14400, 0x1467f, c_oUnicodeRangesLID.Anatolian_Hieroglyphs, lcid_unknown, []),
    new CRange(0x16800, 0x16a3f, c_oUnicodeRangesLID.Bamum_Supplement, lcid_unknown, []),
    new CRange(0x16a40, 0x16a6f, c_oUnicodeRangesLID.Mro, lcid_unknown, []),
    new CRange(0x16ad0, 0x16aff, c_oUnicodeRangesLID.Bassa_Vah, lcid_unknown, []),
    new CRange(0x16b00, 0x16b8f, c_oUnicodeRangesLID.Pahawh_Hmong, lcid_unknown, []),
    new CRange(0x16f00, 0x16f9f, c_oUnicodeRangesLID.Miao, lcid_zhCN, []),
    new CRange(
      0x16fe0,
      0x16fff,
      c_oUnicodeRangesLID.Ideographic_Symbols_and_Punctuation,
      lcid_unknown,
      [],
    ),
    new CRange(0x17000, 0x187ff, c_oUnicodeRangesLID.Tangut, lcid_unknown, []),
    new CRange(0x18800, 0x18aff, c_oUnicodeRangesLID.Tangut_Components, lcid_unknown, []),
    new CRange(0x1b000, 0x1b0ff, c_oUnicodeRangesLID.Kana_Supplement, lcid_unknown, []),
    new CRange(0x1bc00, 0x1bc9f, c_oUnicodeRangesLID.Duployan, lcid_unknown, []),
    new CRange(0x1bca0, 0x1bcaf, c_oUnicodeRangesLID.Shorthand_Format_Controls, lcid_unknown, []),
    new CRange(0x1d000, 0x1d0ff, c_oUnicodeRangesLID.Byzantine_Musical_Symbols, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Byzantine_Musical_Symbols,
      0,
      0,
      0,
    ]),
    new CRange(0x1d100, 0x1d1ff, c_oUnicodeRangesLID.Musical_Symbols, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Byzantine_Musical_Symbols,
      0,
      0,
      0,
    ]),
    new CRange(0x1d200, 0x1d24f, c_oUnicodeRangesLID.Ancient_Greek_Musical_Notation, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Byzantine_Musical_Symbols,
      0,
      0,
      0,
    ]),
    new CRange(0x1d300, 0x1d35f, c_oUnicodeRangesLID.Tai_Xuan_Jing_Symbols, lcid_unknown, []),
    new CRange(0x1d360, 0x1d37f, c_oUnicodeRangesLID.Counting_Rod_Numerals, lcid_unknown, []),
    new CRange(
      0x1d400,
      0x1d7ff,
      c_oUnicodeRangesLID.Mathematical_Alphanumeric_Symbols,
      lcid_unknown,
      [0, 0, 1 << c_oUnicodeRangeOS2_3.Mathematical_Alphanumeric_Symbols, 0, 0, 0],
    ),
    new CRange(0x1d800, 0x1daaf, c_oUnicodeRangesLID.Sutton_SignWriting, lcid_unknown, []),
    new CRange(0x1e000, 0x1e02f, c_oUnicodeRangesLID.Glagolitic_Supplement, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Glagolitic,
      0,
      0,
    ]),
    new CRange(0x1e800, 0x1e8df, c_oUnicodeRangesLID.Mende_Kikakui, lcid_unknown, []),
    new CRange(0x1e900, 0x1e95f, c_oUnicodeRangesLID.Adlam, lcid_unknown, []),
    new CRange(
      0x1ee00,
      0x1eeff,
      c_oUnicodeRangesLID.Arabic_Mathematical_Alphabetic_Symbols,
      lcid_unknown,
      [],
    ),
    new CRange(0x1f000, 0x1f02f, c_oUnicodeRangesLID.Mahjong_Tiles, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Domino_Tiles,
      0,
      0,
    ]),
    new CRange(0x1f030, 0x1f09f, c_oUnicodeRangesLID.Domino_Tiles, lcid_unknown, [
      0,
      0,
      0,
      1 << c_oUnicodeRangeOS2_4.Domino_Tiles,
      0,
      0,
    ]),
    new CRange(0x1f0a0, 0x1f0ff, c_oUnicodeRangesLID.Playing_Cards, lcid_unknown, []),
    new CRange(
      0x1f100,
      0x1f1ff,
      c_oUnicodeRangesLID.Enclosed_Alphanumeric_Supplement,
      lcid_unknown,
      [],
    ),
    new CRange(
      0x1f200,
      0x1f2ff,
      c_oUnicodeRangesLID.Enclosed_Ideographic_Supplement,
      lcid_unknown,
      [],
    ),
    new CRange(
      0x1f300,
      0x1f5ff,
      c_oUnicodeRangesLID.Miscellaneous_Symbols_and_Pictographs,
      lcid_unknown,
      [],
    ),
    new CRange(0x1f600, 0x1f64f, c_oUnicodeRangesLID.Emoticons, lcid_unknown, []),
    new CRange(0x1f650, 0x1f67f, c_oUnicodeRangesLID.Ornamental_Dingbats, lcid_unknown, []),
    new CRange(0x1f680, 0x1f6ff, c_oUnicodeRangesLID.Transport_and_Map_Symbols, lcid_unknown, []),
    new CRange(0x1f700, 0x1f77f, c_oUnicodeRangesLID.Alchemical_Symbols, lcid_unknown, []),
    new CRange(0x1f780, 0x1f7ff, c_oUnicodeRangesLID.Geometric_Shapes_Extended, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Geometric_Shapes,
      0,
      0,
      0,
      0,
    ]),
    new CRange(0x1f800, 0x1f8ff, c_oUnicodeRangesLID.Supplemental_Arrows_C, lcid_unknown, [
      0,
      1 << c_oUnicodeRangeOS2_2.Arrows,
      0,
      0,
      0,
      0,
    ]),
    new CRange(
      0x1f900,
      0x1f9ff,
      c_oUnicodeRangesLID.Supplemental_Symbols_and_Pictographs,
      lcid_unknown,
      [],
    ),
    new CRange(
      0x20000,
      0x2a6df,
      c_oUnicodeRangesLID.CJK_Unified_Ideographs_Extension_B,
      lcid_unknown,
      [
        0,
        0,
        1 << c_oUnicodeRangeOS2_3.CJK_Unified_Ideographs,
        0,
        (1 << c_oCodePagesOS2_1.Chinese_Simplified) | (1 << c_oCodePagesOS2_1.Chinese_Traditional),
        0,
      ],
    ),
    new CRange(
      0x2a700,
      0x2b73f,
      c_oUnicodeRangesLID.CJK_Unified_Ideographs_Extension_C,
      lcid_unknown,
      [
        0,
        0,
        1 << c_oUnicodeRangeOS2_3.CJK_Unified_Ideographs,
        0,
        (1 << c_oCodePagesOS2_1.Chinese_Simplified) | (1 << c_oCodePagesOS2_1.Chinese_Traditional),
        0,
      ],
    ),
    new CRange(
      0x2b740,
      0x2b81f,
      c_oUnicodeRangesLID.CJK_Unified_Ideographs_Extension_D,
      lcid_unknown,
      [
        0,
        0,
        1 << c_oUnicodeRangeOS2_3.CJK_Unified_Ideographs,
        0,
        (1 << c_oCodePagesOS2_1.Chinese_Simplified) | (1 << c_oCodePagesOS2_1.Chinese_Traditional),
        0,
      ],
    ),
    new CRange(
      0x2b820,
      0x2ceaf,
      c_oUnicodeRangesLID.CJK_Unified_Ideographs_Extension_E,
      lcid_unknown,
      [
        0,
        0,
        1 << c_oUnicodeRangeOS2_3.CJK_Unified_Ideographs,
        0,
        (1 << c_oCodePagesOS2_1.Chinese_Simplified) | (1 << c_oCodePagesOS2_1.Chinese_Traditional),
        0,
      ],
    ),
    new CRange(
      0x2f800,
      0x2fa1f,
      c_oUnicodeRangesLID.CJK_Compatibility_Ideographs_Supplement,
      lcid_unknown,
      [
        0,
        0,
        1 << c_oUnicodeRangeOS2_3.CJK_Strokes,
        0,
        (1 << c_oCodePagesOS2_1.Chinese_Simplified) | (1 << c_oCodePagesOS2_1.Chinese_Traditional),
        0,
      ],
    ),
    new CRange(0xe0000, 0xe007f, c_oUnicodeRangesLID.Tags, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Tags,
      0,
      0,
      0,
    ]),
    new CRange(0xe0100, 0xe01ef, c_oUnicodeRangesLID.Variation_Selectors_Supplement, lcid_unknown, [
      0,
      0,
      1 << c_oUnicodeRangeOS2_3.Variation_Selectors,
      0,
      0,
      0,
    ]),
    new CRange(
      0xf0000,
      0xfffff,
      c_oUnicodeRangesLID.Supplementary_Private_Use_Area_A,
      lcid_unknown,
      [0, 0, 1 << c_oUnicodeRangeOS2_3.Private_Use_plane_15, 0, 0, 0],
    ),
    new CRange(
      0x100000,
      0x10ffff,
      c_oUnicodeRangesLID.Supplementary_Private_Use_Area_B,
      lcid_unknown,
      [0, 0, 1 << c_oUnicodeRangeOS2_3.Private_Use_plane_15, 0, 0, 0],
    ),
  ]

  function getRangeBySymbol(_char, _array) {
    // search range by symbol
    let _start = 0
    let _end = _array.length - 1

    const _center = 0
    let _range = null

    if (_start >= _end) return null

    while (_start < _end) {
      const _center = (_start + _end) >> 1
      const _range = _array[_center]

      if (_range.Start > _char) _end = _center - 1
      else if (_range.End < _char) _start = _center + 1
      else return _array[_center]
    }

    if (_start > _end) return null

    _range = _array[_start]
    if (_range.Start > _char || _range.End < _char) return null

    return _array[_start]
  }

  window.getSupportedFonts = (_char) => {
    const _range = getRangeBySymbol(_char, c_oUnicodeRanges)
    return window.getSupportedFontsByRange(_range)
  }

  window.getSupportedFontsByRange = (_range) => {
    if (null == _range) return []

    const _system_fonts = AscFonts.g_fontApplication.g_fontSelections.List
    const _count = _system_fonts.length

    const _retArray = []

    for (let j = 0; j < _count; j++) {
      const _select = _system_fonts[j]

      const _param = _range.Param

      if (_param[0] !== (_select.m_ulUnicodeRange1 & _param[0])) continue

      if (_param[1] !== (_select.m_ulUnicodeRange2 & _param[1])) continue

      if (_param[2] !== (_select.m_ulUnicodeRange3 & _param[2])) continue

      if (_param[3] !== (_select.m_ulUnicodeRange4 & _param[3])) continue

      if (_range.Name === c_oUnicodeRangesLID.CJK_Unified_Ideographs) {
        if (0 === (_select.m_ulCodePageRange1 & _param[4])) continue
      } else {
        if (_param[4] !== (_select.m_ulCodePageRange1 & _param[4])) continue
      }

      if (_param[5] !== (_select.m_ulCodePageRange2 & _param[5])) continue

      _retArray.push(_select.m_wsFontName)
    }

    return _retArray
  }

  window.getSupportedRangesByFont = (_select) => {
    const _ret = []
    for (let i = 0; i < c_oUnicodeRanges.length; ++i) {
      const _range = c_oUnicodeRanges[i]
      const _param = _range.Param
      if (_param[0] !== (_select.m_ulUnicodeRange1 & _param[0])) continue

      if (_param[1] !== (_select.m_ulUnicodeRange2 & _param[1])) continue

      if (_param[2] !== (_select.m_ulUnicodeRange3 & _param[2])) continue

      if (_param[3] !== (_select.m_ulUnicodeRange4 & _param[3])) continue

      /*if (_range.Name == c_oUnicodeRangesLID.CJK_Unified_Ideographs)
            {
                if (0 == (_select.m_ulCodePageRange1 & _param[4]))
                    continue;
            }
            else
            {
                if (_param[4] != (_select.m_ulCodePageRange1 & _param[4]))
                    continue;
            }*/

      if (_param[4] !== (_select.m_ulCodePageRange1 & _param[4])) continue

      if (_param[5] !== (_select.m_ulCodePageRange2 & _param[5])) continue
      _ret.push(_range)
    }

    if (_ret.length === 0) {
      _ret.push(
        new CRange(0x0020, 0x007e, c_oUnicodeRangesLID.Basic_Latin, lcid_enUS, [
          1 << c_oUnicodeRangeOS2_1.Basic_Latin,
          0,
          0,
          0,
          1 << c_oCodePagesOS2_1.Latin_1,
          0,
        ]),
      )
      _ret.push(
        new CRange(0x00a0, 0x00ff, c_oUnicodeRangesLID.Latin_1_Supplement, lcid_unknown, [
          (1 << c_oUnicodeRangeOS2_1.Basic_Latin) | (1 << c_oUnicodeRangeOS2_1.Latin_1_Supplement),
          0,
          0,
          0,
          1 << c_oCodePagesOS2_1.Latin_1,
          0,
        ]),
      )
    }
    return _ret
  }
})(window)
