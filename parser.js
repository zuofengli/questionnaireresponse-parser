// Store the elements where the markup will be applied
var qrSection = document.getElementById('QuestionnaireResponse');
var qrJSONInput = document.getElementById('jsonInput');
var qrSubmitButton = document.getElementById('submit');
var qrDropdownBox = document.getElementById('jsonDropdown');

// Initial JSON load
const qrSampleRequestURL = 'sample.json';
const qrSampleNoHeadersRequestURL = 'samplenoheaders.json';
const qrExampleHomecareRequestURL = 'samplehomecareref.json';
const qrSampleSimpleRequestURL = 'qrsample-simple.json';
const qrSampleMediumRequestURL = 'qrsample-medium.json';
const qrSampleComplexRequestURL = 'qrsample-complex.json';

getJSONData(qrSampleRequestURL);

/* Receives a URL pointing to a JSON file parses through the retrived data, stores
it in the textarea for editing, and updates the page to display it */
function getJSONData(URL) {
    let qrRequest = new XMLHttpRequest();
    qrRequest.open('GET', URL);
    qrRequest.responseType = 'json';
    qrRequest.send();

    /* When the JSON loads, call the function to populate the payload data onto the
    webpage and populate the text-area with a text version of the data for testing */
    qrRequest.onload = function() {
        let qResponse = qrRequest.response;
        qrJSONInput.textContent = JSON.stringify(qResponse, undefined, 3);
        populateResponse(qResponse);
    };
}

// Event Listener for the dropdown box
qrDropdownBox.addEventListener('change', event => {
    const result = event.target.value;

    clearJSONResults();
    if (result == 1) {
        getJSONData(qrSampleRequestURL);
    }
    if (result == 2) {
        getJSONData(qrSampleNoHeadersRequestURL);
    }
    if (result == 3) {
        getJSONData(qrExampleHomecareRequestURL);
    }
    if (result == 4) {
        getJSONData(qrSampleSimpleRequestURL);
    }
    if (result == 5) {
        getJSONData(qrSampleMediumRequestURL);
    }
    if (result == 6) {
        getJSONData(qrSampleComplexRequestURL);
    }
});

// Event Listener for the submit button
qrSubmitButton.addEventListener('click', function(event) {
    clearJSONResults();

    // Populate the page with new data taken from the textview
    let updateText = qrJSONInput.value;
    let updatedJSON = JSON.parse(updateText);
    populateResponse(updatedJSON);
});

/* Parse through the JSON file, checking for nested and conditional properties,
then displaying all of the response contents to a section on the page */
function populateResponse(jsonObj) {
    /**
     *
     * @param {object} questionnaireResponse
     */
    const parse = questionnaireResponse => {
        if (questionnaireResponse.item) {
            parseItem(questionnaireResponse.item, 1);
        } else {
            console.log('Invalid Questionnaire Response.');
        }
    };

    /**
     *
     * @param {array} item
     */
    const parseItem = (item, depth) => {
        item.forEach(i => {
            console.log(`###### ${i.text}`);

            // non-headers
            if (i.answer) {
                let line = renderQuestion(i, depth);
                qrSection.appendChild(line);

                if (i.answer[0].hasOwnProperty('item')) {
                    console.log('SUB QUESTIONS FOLLOW?');
                    console.log(getAnswerText(i.answer[0]));

                    let answer = renderAnswer(i.answer[0], depth);
                    line.appendChild(answer);
                }
                parseAnswer(i.answer, line, depth + 1);
            }

            if (i.item) {
                // headers
                if (depth < 2) {
                    if (!i.answer) {
                        let line = renderHeader(i);
                        qrSection.appendChild(line);
                        console.log('ITEM.ITEM depth: %s', depth.toString());
                    }
                }

                parseItem(i.item, depth + 1);
            }

            console.log('TOTAL depth: %s', depth);
        });
    };

    /**
     *
     * @param {array} answer
     */
    const parseAnswer = (answer, line, depth) => {
        answer.forEach(e => {
            if (e.item) {
                // conditional sub-question
                parseItemWithSubQuestion(e.item, depth + 1);
            } else {
                console.log(Object.values(e).toString());

                let answer = renderAnswer(e, depth);
                line.appendChild(answer);
            }
        });
    };

    const parseItemWithSubQuestion = (item, depth) => {
        item.forEach(i => {
            if (i.answer) {
                //SUB QUESTIONS AND ANSWERS
                let line = renderQuestion(i, depth);
                line.classList.add('indent');
                qrSection.appendChild(line);
                let answer = renderAnswer(i.answer[0], depth);
                line.appendChild(answer);
            }

            if (i.item) {
                parseItem(i.item, depth + 1);
            }
        });
    };

    parse(jsonObj);
}

/* Takes an answer object, destructures it and determines which types and
 values it is holding then returns the value as a string. Returns an empty
  string if it does not contain a supported type */
function getAnswerText({
    valueBoolean,
    valueDecimal,
    valueInteger,
    valueDate,
    valueDateTime,
    valueTime,
    valueString,
    valueUri,
    valueAttachment,
    valueCoding,
    valueQuantity
}) {
    let response = '';

    if (typeof valueBoolean !== 'undefined') {
        response += valueBoolean;
    }

    if (typeof valueDecimal !== 'undefined') {
        response += valueDecimal;
    }

    if (typeof valueInteger !== 'undefined') {
        response += valueInteger;
    }

    if (typeof valueDate !== 'undefined') {
        response += valueDate;
    }

    if (typeof valueDateTime !== 'undefined') {
        response += valueDateTime;
    }

    if (typeof valueTime !== 'undefined') {
        response += valueTime;
    }

    if (typeof valueString !== 'undefined') {
        response += valueString;
    }

    if (typeof valueUri !== 'undefined') {
        response += valueUri;
    }

    if (typeof valueAttachment !== 'undefined') {
        response += valueAttachment;
    }

    if (typeof valueCoding !== 'undefined') {
        response += valueCoding;
    }

    if (typeof valueQuantity !== 'undefined') {
        response += valueQuantity;
    }

    return response;
}

/* Displays a question on the page by taking an object, creating a paragraph element,
styling it bold with a span, and then returning the question paragraph as an object,
verifies whether the last character of the question is a semi-colon, if not one is added */
function renderQuestion(obj, depth) {
    let { text } = obj;
    let line = document.createElement('p');
    let question = document.createElement('span');
    question.classList.add('question');
    if (text.charAt(text.length - 1) == ':') {
        question.textContent = text + ' ';
    } else if (text.charAt(text.length - 1) == ' ') {
        if (text.charAt(text.length - 2) == ':') {
            question.textContent = text + ' ';
        }
    } else {
        question.textContent = text + ': ';
    }
    line.appendChild(question);

    return line;
}

/**
 * Takes an item object, displays a header on the page, creating an h1 element,
 * and then returning the header as an object
 * @param {text} object.text
 */
function renderHeader({ text }) {
    let line = document.createElement('h1');
    line.textContent = text;
    return line;
}

/* Displays an answer on the page by taking an object, creating a span element with a
normal style applied, to remove any bolding, and then returns the answer as an object */
function renderAnswer(obj, depth) {
    let answer = document.createElement('span');
    answer.classList.add('answer');
    answer.textContent = getAnswerText(obj);

    return answer;
}

/* Displays a Multi-line answer on the page by taking an object, creating a span element
with a normal style applied, to remove any bolding, adding a comma at the end, and then
returns the answer as an object */
function renderMultiAnswer(obj) {
    let answer = document.createElement('span');
    answer.textContent = getAnswerText(obj) + ', ';

    return answer;
}

// Remove the previous JSON data from the page so new data can be displayed
function clearJSONResults() {
    while (qrSection.firstChild) {
        qrSection.removeChild(qrSection.firstChild);
    }
}

// Determines if the provided json object is the "resource" or nested within a "resource" object
function getQRObj(object) {
    let obj;

    if (typeof object.resourceType !== 'undefined') {
        obj = object;
    } else if (typeof object.resource.resourceType !== 'undefined') {
        obj = object.resource;
    }

    return obj;
}
