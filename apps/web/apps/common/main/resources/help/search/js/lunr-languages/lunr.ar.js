/*!
 * Lunr languages, `Arabic` language
 * https://github.com/MihaiValentin/lunr-languages
 *
 * Copyright 2018, Dalia Al-Shahrabi
 * http://www.mozilla.org/MPL/
 */
/*!
 * based on
 * Kazem Taghva, Rania Elkhoury, and Jeffrey Coombs (2005)
 * Meryeme Hadni, Abdelmonaime Lachkar, and S. Alaoui Ouatik (2012)
 *
 * Snowball JavaScript Library v0.3
 * http://code.google.com/p/urim/
 * http://snowball.tartarus.org/
 *
 * Copyright 2010, Oleg Mazko
 * http://www.mozilla.org/MPL/
 */

/**
 * export the module via AMD, CommonJS or as a browser global
 * Export code from https://github.com/umdjs/umd/blob/master/returnExports.js
 */
;((root, factory) => {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory)
  } else if (typeof exports === "object") {
    /**
     * Node. Does not work with strict CommonJS, but
     * only CommonJS-like environments that support module.exports,
     * like Node.
     */
    module.exports = factory()
  } else {
    // Browser globals (root is window)
    factory()(root.lunr)
  }
})(this, () => {
  /**
   * Just return a value to define the module export.
   * This example returns an object, but the module
   * can return a function as the exported value.
   */
  return (lunr) => {
    /* throw error if lunr is not yet included */
    if ("undefined" === typeof lunr) {
      throw new Error("Lunr is not present. Please include / require Lunr before this script.")
    }

    /* throw error if lunr stemmer support is not yet included */
    if ("undefined" === typeof lunr.stemmerSupport) {
      throw new Error(
        "Lunr stemmer support is not present. Please include / require Lunr stemmer support before this script.",
      )
    }

    /* register specific locale function */
    lunr.ar = function () {
      this.pipeline.reset()
      this.pipeline.add(lunr.ar.trimmer, lunr.ar.stopWordFilter, lunr.ar.stemmer)

      // for lunr version 2
      // this is necessary so that every searched word is also stemmed before
      // in lunr <= 1 this is not needed, as it is done using the normal pipeline
      if (this.searchPipeline) {
        this.searchPipeline.reset()
        this.searchPipeline.add(lunr.ar.stemmer)
      }
    }

    /* lunr trimmer function */
    lunr.ar.wordCharacters = "\u0621-\u065b\u0671\u0640"
    lunr.ar.trimmer = lunr.trimmerSupport.generateTrimmer(lunr.ar.wordCharacters)

    lunr.Pipeline.registerFunction(lunr.ar.trimmer, "trimmer-ar")

    /* lunr stemmer function */
    lunr.ar.stemmer = (function () {
      const word = ""
      this.result = false
      this.preRemoved = false
      this.sufRemoved = false

      //prefix data
      this.pre = {
        pre1: "ف ك ب و س ل ن ا ي ت",
        pre2: "ال لل",
        pre3: "بال وال فال تال كال ولل",
        pre4: "فبال كبال وبال وكال",
      }

      //suffix data
      this.suf = {
        suf1: "ه ك ت ن ا ي",
        suf2: "نك نه ها وك يا اه ون ين تن تم نا وا ان كم كن ني نن ما هم هن تك ته ات يه",
        suf3: "تين كهم نيه نهم ونه وها يهم ونا ونك وني وهم تكم تنا تها تني تهم كما كها ناه نكم هنا تان يها",
        suf4: "كموه ناها ونني ونهم تكما تموه تكاه كماه ناكم ناهم نيها وننا",
      }

      //arabic language patterns and alternative mapping for patterns
      this.patterns = JSON.parse(
        '{"pt43":[{"pt":[{"c":"ا","l":1}]},{"pt":[{"c":"ا,ت,ن,ي","l":0}],"mPt":[{"c":"ف","l":0,"m":1},{"c":"ع","l":1,"m":2},{"c":"ل","l":2,"m":3}]},{"pt":[{"c":"و","l":2}],"mPt":[{"c":"ف","l":0,"m":0},{"c":"ع","l":1,"m":1},{"c":"ل","l":2,"m":3}]},{"pt":[{"c":"ا","l":2}]},{"pt":[{"c":"ي","l":2}],"mPt":[{"c":"ف","l":0,"m":0},{"c":"ع","l":1,"m":1},{"c":"ا","l":2},{"c":"ل","l":3,"m":3}]},{"pt":[{"c":"م","l":0}]}],"pt53":[{"pt":[{"c":"ت","l":0},{"c":"ا","l":2}]},{"pt":[{"c":"ا,ن,ت,ي","l":0},{"c":"ت","l":2}],"mPt":[{"c":"ا","l":0},{"c":"ف","l":1,"m":1},{"c":"ت","l":2},{"c":"ع","l":3,"m":3},{"c":"ا","l":4},{"c":"ل","l":5,"m":4}]},{"pt":[{"c":"ا","l":0},{"c":"ا","l":2}],"mPt":[{"c":"ا","l":0},{"c":"ف","l":1,"m":1},{"c":"ع","l":2,"m":3},{"c":"ل","l":3,"m":4},{"c":"ا","l":4},{"c":"ل","l":5,"m":4}]},{"pt":[{"c":"ا","l":0},{"c":"ا","l":3}],"mPt":[{"c":"ف","l":0,"m":1},{"c":"ع","l":1,"m":2},{"c":"ل","l":2,"m":4}]},{"pt":[{"c":"ا","l":3},{"c":"ن","l":4}]},{"pt":[{"c":"ت","l":0},{"c":"ي","l":3}]},{"pt":[{"c":"م","l":0},{"c":"و","l":3}]},{"pt":[{"c":"ا","l":1},{"c":"و","l":3}]},{"pt":[{"c":"و","l":1},{"c":"ا","l":2}]},{"pt":[{"c":"م","l":0},{"c":"ا","l":3}]},{"pt":[{"c":"م","l":0},{"c":"ي","l":3}]},{"pt":[{"c":"ا","l":2},{"c":"ن","l":3}]},{"pt":[{"c":"م","l":0},{"c":"ن","l":1}],"mPt":[{"c":"ا","l":0},{"c":"ن","l":1},{"c":"ف","l":2,"m":2},{"c":"ع","l":3,"m":3},{"c":"ا","l":4},{"c":"ل","l":5,"m":4}]},{"pt":[{"c":"م","l":0},{"c":"ت","l":2}],"mPt":[{"c":"ا","l":0},{"c":"ف","l":1,"m":1},{"c":"ت","l":2},{"c":"ع","l":3,"m":3},{"c":"ا","l":4},{"c":"ل","l":5,"m":4}]},{"pt":[{"c":"م","l":0},{"c":"ا","l":2}]},{"pt":[{"c":"م","l":1},{"c":"ا","l":3}]},{"pt":[{"c":"ي,ت,ا,ن","l":0},{"c":"ت","l":1}],"mPt":[{"c":"ف","l":0,"m":2},{"c":"ع","l":1,"m":3},{"c":"ا","l":2},{"c":"ل","l":3,"m":4}]},{"pt":[{"c":"ت,ي,ا,ن","l":0},{"c":"ت","l":2}],"mPt":[{"c":"ا","l":0},{"c":"ف","l":1,"m":1},{"c":"ت","l":2},{"c":"ع","l":3,"m":3},{"c":"ا","l":4},{"c":"ل","l":5,"m":4}]},{"pt":[{"c":"ا","l":2},{"c":"ي","l":3}]},{"pt":[{"c":"ا,ي,ت,ن","l":0},{"c":"ن","l":1}],"mPt":[{"c":"ا","l":0},{"c":"ن","l":1},{"c":"ف","l":2,"m":2},{"c":"ع","l":3,"m":3},{"c":"ا","l":4},{"c":"ل","l":5,"m":4}]},{"pt":[{"c":"ا","l":3},{"c":"ء","l":4}]}],"pt63":[{"pt":[{"c":"ا","l":0},{"c":"ت","l":2},{"c":"ا","l":4}]},{"pt":[{"c":"ا,ت,ن,ي","l":0},{"c":"س","l":1},{"c":"ت","l":2}],"mPt":[{"c":"ا","l":0},{"c":"س","l":1},{"c":"ت","l":2},{"c":"ف","l":3,"m":3},{"c":"ع","l":4,"m":4},{"c":"ا","l":5},{"c":"ل","l":6,"m":5}]},{"pt":[{"c":"ا,ن,ت,ي","l":0},{"c":"و","l":3}]},{"pt":[{"c":"م","l":0},{"c":"س","l":1},{"c":"ت","l":2}],"mPt":[{"c":"ا","l":0},{"c":"س","l":1},{"c":"ت","l":2},{"c":"ف","l":3,"m":3},{"c":"ع","l":4,"m":4},{"c":"ا","l":5},{"c":"ل","l":6,"m":5}]},{"pt":[{"c":"ي","l":1},{"c":"ي","l":3},{"c":"ا","l":4},{"c":"ء","l":5}]},{"pt":[{"c":"ا","l":0},{"c":"ن","l":1},{"c":"ا","l":4}]}],"pt54":[{"pt":[{"c":"ت","l":0}]},{"pt":[{"c":"ا,ي,ت,ن","l":0}],"mPt":[{"c":"ا","l":0},{"c":"ف","l":1,"m":1},{"c":"ع","l":2,"m":2},{"c":"ل","l":3,"m":3},{"c":"ر","l":4,"m":4},{"c":"ا","l":5},{"c":"ر","l":6,"m":4}]},{"pt":[{"c":"م","l":0}],"mPt":[{"c":"ا","l":0},{"c":"ف","l":1,"m":1},{"c":"ع","l":2,"m":2},{"c":"ل","l":3,"m":3},{"c":"ر","l":4,"m":4},{"c":"ا","l":5},{"c":"ر","l":6,"m":4}]},{"pt":[{"c":"ا","l":2}]},{"pt":[{"c":"ا","l":0},{"c":"ن","l":2}]}],"pt64":[{"pt":[{"c":"ا","l":0},{"c":"ا","l":4}]},{"pt":[{"c":"م","l":0},{"c":"ت","l":1}]}],"pt73":[{"pt":[{"c":"ا","l":0},{"c":"س","l":1},{"c":"ت","l":2},{"c":"ا","l":5}]}],"pt75":[{"pt":[{"c":"ا","l":0},{"c":"ا","l":5}]}]}',
      )

      this.execArray = [
        "cleanWord",
        "removeDiacritics",
        "cleanAlef",
        "removeStopWords",
        "normalizeHamzaAndAlef",
        "removeStartWaw",
        "removePre432",
        "removeEndTaa",
        "wordCheck",
      ]

      this.stem = () => {
        let counter = 0
        this.result = false
        this.preRemoved = false
        this.sufRemoved = false
        while (counter < this.execArray.length && this.result !== true) {
          this.result = this[this.execArray[counter]]()
          counter++
        }
      }

      this.setCurrent = (word) => {
        this.word = word
      }

      this.getCurrent = () => this.word

      /*remove elongating character and test that the word does not contain non-arabic characters.
      If the word contains special characters, don't stem. */
      this.cleanWord = () => {
        const wordCharacters = "\u0621-\u065b\u0671\u0640"
        const testRegex = new RegExp(`[^${wordCharacters}]`)
        this.word = this.word.replace(/\u0640/g, "")
        if (testRegex.test(word)) {
          return true
        }
        return false
      }

      this.removeDiacritics = () => {
        const diacriticsRegex = /[\u064b-\u065b]/
        this.word = this.word.replace(/[\u064b-\u065b]/gi, "")
        return false
      }

      /*Replace all variations of alef (آأإٱى) to a plain alef (ا)*/
      this.cleanAlef = () => {
        const alefRegex = /[\u0622\u0623\u0625\u0671\u0649]/
        this.word = this.word.replace(alefRegex, "\u0627")
        return false
      }

      /* if the word is a stop word, don't stem*/
      this.removeStopWords = () => {
        const stopWords =
          "، اض امين اه اها اي ا اب اجل اجمع اخ اخذ اصبح اضحى اقبل اقل اكثر الا ام اما امامك امامك امسى اما ان انا انت انتم انتما انتن انت انشا انى او اوشك اولئك اولئكم اولاء اولالك اوه اي ايا اين اينما اي ان اي اف اذ اذا اذا اذما اذن الى اليكم اليكما اليكن اليك اليك الا اما ان انما اي اياك اياكم اياكما اياكن ايانا اياه اياها اياهم اياهما اياهن اياي ايه ان ا ابتدا اثر اجل احد اخرى اخلولق اذا اربعة ارتد استحال اطار اعادة اعلنت اف اكثر اكد الالاء الالى الا الاخيرة الان الاول الاولى التى التي الثاني الثانية الذاتي الذى الذي الذين السابق الف اللائي اللاتي اللتان اللتيا اللتين اللذان اللذين اللواتي الماضي المقبل الوقت الى اليوم اما امام امس ان انبرى انقلب انه انها او اول اي ايار ايام ايضا ب بات باسم بان بخ برس بسبب بس بشكل بضع بطان بعد بعض بك بكم بكما بكن بل بلى بما بماذا بمن بن بنا به بها بي بيد بين بس بله بئس تان تانك تبدل تجاه تحول تلقاء تلك تلكم تلكما تم تينك تين ته تي ثلاثة ثم ثم ثمة ثم جعل جلل جميع جير حار حاشا حاليا حاي حتى حرى حسب حم حوالى حول حيث حيثما حين حي حبذا حتى حذار خلا خلال دون دونك ذا ذات ذاك ذانك ذان ذلك ذلكم ذلكما ذلكن ذو ذوا ذواتا ذواتي ذيت ذينك ذين ذه ذي راح رجع رويدك ريث رب زيارة سبحان سرعان سنة سنوات سوف سوى ساء ساءما شبه شخصا شرع شتان صار صباح صفر صه صه ضد ضمن طاق طالما طفق طق ظل عاد عام عاما عامة عدا عدة عدد عدم عسى عشر عشرة علق على عليك عليه عليها عل عن عند عندما عوض عين عدس عما غدا غير  ف فان فلان فو فى في فيم فيما فيه فيها قال قام قبل قد قط قلما قوة كانما كاين كاي كاين كاد كان كانت كذا كذلك كرب كل كلا كلاهما كلتا كلم كليكما كليهما كلما كلا كم كما كي كيت كيف كيفما كان كخ لئن لا لات لاسيما لدن لدى لعمر لقاء لك لكم لكما لكن لكنما لكي لكيلا للامم لم لما لما لن لنا له لها لو لوكالة لولا لوما لي لست لست لستم لستما لستن لست لسن لعل لكن ليت ليس ليسا ليستا ليست ليسوا لسنا ما ماانفك مابرح مادام ماذا مازال مافتئ مايو متى مثل مذ مساء مع معاذ مقابل مكانكم مكانكما مكانكن مكانك مليار مليون مما ممن من منذ منها مه مهما من من نحن نحو نعم نفس نفسه نهاية نخ نعما نعم ها هاؤم هاك هاهنا هب هذا هذه هكذا هل هلم هلا هم هما هن هنا هناك هنالك هو هي هيا هيت هيا هؤلاء هاتان هاتين هاته هاتي هج هذا هذان هذين هذه هذي هيهات و وا واحد واضاف واضافت واكد وان واها واوضح وراءك وفي وقال وقالت وقد وقف وكان وكانت ولا ولم ومن وهو وهي ويكان وي وشكان يكون يمكن يوم ايان".split(
            " ",
          )
        if (stopWords.indexOf(this.word) >= 0) {
          return true
        }
      }

      /* changes ؤ ئ to ء and removes alef if at the end of the word*/
      this.normalizeHamzaAndAlef = () => {
        this.word = this.word.replace("\u0624", "\u0621")
        this.word = this.word.replace("\u0626", "\u0621")
        this.word = this.word.replace(/([\u0627])\1+/gi, "\u0627")
        return false
      }

      /*remove end taa marboota ة*/
      this.removeEndTaa = () => {
        if (this.word.length > 2) {
          this.word = this.word.replace(/[\u0627]$/, "")
          this.word = this.word.replace("\u0629", "")
          return false
        }
        return true
      }

      /* if the word starts with double waw وو keep only one of them */
      this.removeStartWaw = () => {
        if (this.word.length > 3 && this.word[0] === "\u0648" && this.word[1] === "\u0648") {
          this.word = this.word.slice(1)
        }
        return false
      }

      /* remove prefixes of size 4, 3 and 2 characters  */
      this.removePre432 = () => {
        const word = this.word
        if (this.word.length >= 7) {
          const pre4Regex = new RegExp(`^(${this.pre.pre4.split(" ").join("|")})`)
          this.word = this.word.replace(pre4Regex, "")
        }
        if (this.word === word && this.word.length >= 6) {
          const pre3Regex = new RegExp(`^(${this.pre.pre3.split(" ").join("|")})`)
          this.word = this.word.replace(pre3Regex, "")
        }
        if (this.word === word && this.word.length >= 5) {
          const pre2Regex = new RegExp(`^(${this.pre.pre2.split(" ").join("|")})`)
          this.word = this.word.replace(pre2Regex, "")
        }
        if (word !== this.word) this.preRemoved = true
        return false
      }

      /* check the word against word patterns. If the word matches a pattern, map it to the 
      alternative pattern if available then stop stemming. */
      this.patternCheck = (pattern) => {
        const patternMatch = false
        for (let i = 0; i < pattern.length; i++) {
          let currentPatternCheck = true
          for (let j = 0; j < pattern[i].pt.length; j++) {
            const chars = pattern[i].pt[j].c.split(",")
            let charMatch = false
            chars.forEach((el) => {
              if (this.word[pattern[i].pt[j].l] === el) {
                charMatch = true
              }
            })
            if (!charMatch) {
              currentPatternCheck = false
              break
            }
          }
          if (currentPatternCheck === true) {
            if (pattern[i].mPt) {
              const newWord = []
              for (let k = 0; k < pattern[i].mPt.length; k++) {
                if (pattern[i].mPt[k].m != null) {
                  newWord[pattern[i].mPt[k].l] = this.word[pattern[i].mPt[k].m]
                } else {
                  newWord[pattern[i].mPt[k].l] = pattern[i].mPt[k].c
                }
              }
              this.word = newWord.join("")
            }
            this.result = true
            break
          }
        }
      }

      /* remove prefixes of size 1 char*/
      this.removePre1 = () => {
        const word = this.word
        if (this.preRemoved === false)
          if (this.word.length > 3) {
            const pre1Regex = new RegExp(`^(${this.pre.pre1.split(" ").join("|")})`)
            this.word = this.word.replace(pre1Regex, "")
          }
        if (word !== this.word) this.preRemoved = true
        return false
      }

      /*remove suffixes of size 1 char */
      this.removeSuf1 = () => {
        const word = this.word
        if (this.sufRemoved === false)
          if (this.word.length > 3) {
            const suf1Regex = new RegExp(`(${this.suf.suf1.split(" ").join("|")})$`)
            this.word = this.word.replace(suf1Regex, "")
          }
        if (word !== this.word) this.sufRemoved = true
        return false
      }

      /*remove suffixes of size 4, 3 and 2 chars*/
      this.removeSuf432 = () => {
        const word = this.word
        if (this.word.length >= 6) {
          const suf4Regex = new RegExp(`(${this.suf.suf4.split(" ").join("|")})$`)
          this.word = this.word.replace(suf4Regex, "")
        }
        if (this.word === word && this.word.length >= 5) {
          const suf3Regex = new RegExp(`(${this.suf.suf3.split(" ").join("|")})$`)
          this.word = this.word.replace(suf3Regex, "")
        }
        if (this.word === word && this.word.length >= 4) {
          const suf2Regex = new RegExp(`(${this.suf.suf2.split(" ").join("|")})$`)
          this.word = this.word.replace(suf2Regex, "")
        }
        if (word !== this.word) this.sufRemoved = true
        return false
      }

      /*check the word length and decide what is the next step accordingly*/
      this.wordCheck = () => {
        const word = this.word
        const word7Exec = [this.removeSuf432, this.removeSuf1, this.removePre1]
        let counter = 0
        let patternChecked = false
        while (this.word.length >= 7 && !this.result && counter < word7Exec.length) {
          if (this.word.length === 7 && !patternChecked) {
            this.checkPattern73()
            patternChecked = true
          } else {
            word7Exec[counter]()
            counter++
            patternChecked = false
          }
        }

        const word6Exec = [
          this.checkPattern63,
          this.removeSuf432,
          this.removeSuf1,
          this.removePre1,
          this.checkPattern64,
        ]
        counter = 0
        while (this.word.length === 6 && !this.result && counter < word6Exec.length) {
          word6Exec[counter]()
          counter++
        }

        const word5Exec = [
          this.checkPattern53,
          this.removeSuf432,
          this.removeSuf1,
          this.removePre1,
          this.checkPattern54,
        ]
        counter = 0
        while (this.word.length === 5 && !this.result && counter < word5Exec.length) {
          word5Exec[counter]()
          counter++
        }

        const word4Exec = [this.checkPattern43, this.removeSuf1, this.removePre1, this.removeSuf432]
        counter = 0
        while (this.word.length === 4 && !this.result && counter < word4Exec.length) {
          word4Exec[counter]()
          counter++
        }
        return true
      }

      this.checkPattern43 = () => {
        this.patternCheck(this.patterns.pt43)
      }
      this.checkPattern53 = () => {
        this.patternCheck(this.patterns.pt53)
      }
      this.checkPattern54 = () => {
        this.patternCheck(this.patterns.pt54)
      }
      this.checkPattern63 = () => {
        this.patternCheck(this.patterns.pt63)
      }
      this.checkPattern64 = () => {
        this.patternCheck(this.patterns.pt64)
      }
      this.checkPattern73 = () => {
        this.patternCheck(this.patterns.pt73)
      }

      /* and return a function that stems a word for the current locale */
      return (token) => {
        // for lunr version 2
        if (typeof token.update === "function") {
          return token.update((word) => {
            this.setCurrent(word)
            this.stem()
            return this.getCurrent()
          })
        }
        this.setCurrent(token)
        this.stem()
        return this.getCurrent()
      }
    })()

    lunr.Pipeline.registerFunction(lunr.ar.stemmer, "stemmer-ar")

    lunr.ar.stopWordFilter = lunr.generateStopWordFilter(
      "، اض امين اه اها اي ا اب اجل اجمع اخ اخذ اصبح اضحى اقبل اقل اكثر الا ام اما امامك امامك امسى اما ان انا انت انتم انتما انتن انت انشا انى او اوشك اولئك اولئكم اولاء اولالك اوه اي ايا اين اينما اي ان اي اف اذ اذا اذا اذما اذن الى اليكم اليكما اليكن اليك اليك الا اما ان انما اي اياك اياكم اياكما اياكن ايانا اياه اياها اياهم اياهما اياهن اياي ايه ان ا ابتدا اثر اجل احد اخرى اخلولق اذا اربعة ارتد استحال اطار اعادة اعلنت اف اكثر اكد الالاء الالى الا الاخيرة الان الاول الاولى التى التي الثاني الثانية الذاتي الذى الذي الذين السابق الف اللائي اللاتي اللتان اللتيا اللتين اللذان اللذين اللواتي الماضي المقبل الوقت الى اليوم اما امام امس ان انبرى انقلب انه انها او اول اي ايار ايام ايضا ب بات باسم بان بخ برس بسبب بس بشكل بضع بطان بعد بعض بك بكم بكما بكن بل بلى بما بماذا بمن بن بنا به بها بي بيد بين بس بله بئس تان تانك تبدل تجاه تحول تلقاء تلك تلكم تلكما تم تينك تين ته تي ثلاثة ثم ثم ثمة ثم جعل جلل جميع جير حار حاشا حاليا حاي حتى حرى حسب حم حوالى حول حيث حيثما حين حي حبذا حتى حذار خلا خلال دون دونك ذا ذات ذاك ذانك ذان ذلك ذلكم ذلكما ذلكن ذو ذوا ذواتا ذواتي ذيت ذينك ذين ذه ذي راح رجع رويدك ريث رب زيارة سبحان سرعان سنة سنوات سوف سوى ساء ساءما شبه شخصا شرع شتان صار صباح صفر صه صه ضد ضمن طاق طالما طفق طق ظل عاد عام عاما عامة عدا عدة عدد عدم عسى عشر عشرة علق على عليك عليه عليها عل عن عند عندما عوض عين عدس عما غدا غير  ف فان فلان فو فى في فيم فيما فيه فيها قال قام قبل قد قط قلما قوة كانما كاين كاي كاين كاد كان كانت كذا كذلك كرب كل كلا كلاهما كلتا كلم كليكما كليهما كلما كلا كم كما كي كيت كيف كيفما كان كخ لئن لا لات لاسيما لدن لدى لعمر لقاء لك لكم لكما لكن لكنما لكي لكيلا للامم لم لما لما لن لنا له لها لو لوكالة لولا لوما لي لست لست لستم لستما لستن لست لسن لعل لكن ليت ليس ليسا ليستا ليست ليسوا لسنا ما ماانفك مابرح مادام ماذا مازال مافتئ مايو متى مثل مذ مساء مع معاذ مقابل مكانكم مكانكما مكانكن مكانك مليار مليون مما ممن من منذ منها مه مهما من من نحن نحو نعم نفس نفسه نهاية نخ نعما نعم ها هاؤم هاك هاهنا هب هذا هذه هكذا هل هلم هلا هم هما هن هنا هناك هنالك هو هي هيا هيت هيا هؤلاء هاتان هاتين هاته هاتي هج هذا هذان هذين هذه هذي هيهات وا واحد واضاف واضافت واكد وان واها واوضح وراءك وفي وقال وقالت وقد وقف وكان وكانت ولا ولم ومن وهو وهي ويكان وي وشكان يكون يمكن يوم ايان".split(
        " ",
      ),
    )

    lunr.Pipeline.registerFunction(lunr.ar.stopWordFilter, "stopWordFilter-ar")
  }
})
