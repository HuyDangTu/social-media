import moment from 'moment';

export const generateData = (formdata, formName) =>{
    
    let dataToSubmit = {};
    for (let key in formdata){
        if(key !== 'confirmPassword')
        {
            if(key === 'dob'){
                if(formdata[key].valueAsNumber){
                dataToSubmit[key] = formdata[key].valueAsNumber; 
                }
                else{
                    dataToSubmit[key] = moment(formdata[key].value).format("YYYY-MM-DD")
                }
            }else{
                dataToSubmit[key] = formdata[key].value;
            }
        }
    }
    return dataToSubmit;
}

export const ifFormValid = (formdata,formName) =>{
    let formValid = true;

    for (let key in formdata)
    {
        console.log(formdata[key].valid)
        formValid = formdata[key].valid && formValid;
    }

    console.log("ress", formValid)
    return formValid;
}

//Nhận vào element và formdata(từ State của login truyền thông qua hàm update)
export const validate = (element,formdata=[]) =>{
    
    let error = [true,''];

    if (element.validation.confirm) {
        const valid = element.value.trim() === formdata[element.validation.confirm].value;
        const message = `${ valid ?'':'Password do not match'}`;
        error = !valid ? [valid, message] : error;
    }

    // Nếu giá trị email trong Validation = true thì kiểm tra value vs regex     
    if (element.validation.email){
        const valid = /(.+)@(.+){2,}\.(.+){2,}/.test(element.value);
        const message = `${!valid ? 'Must be a valid email' : ''}`;
        error = !valid ? [valid, message] : error;
    }

    // Nếu giá trị required trong Validation = true thì kiểm tra value có rổng hay không  
    if(element.validation.required){
        const valid = element.value.trim() !== '';
        const message = `${!valid ? 'this field is required' : ''}`;
        error = !valid ? [valid,message] : error;
    }

    return error;
}

export const update = (element, formdata, formName) =>{

    //element gồm: event(event.target để lấy ra data ng dùng nhập trong field đi validate),
    //             Id(để xác định là field nào),
    //             blur( luôn luôn bằng true) 

    //copy formdata(formdata từ state của component login) ra một newFormData để cập nhật lại các giá trị 
    const newFormdata = {...formdata};

    //Lấy ra formData của đối tượng có Id bằng với element.Id truyền vào 
    const newElement = {
        ...newFormdata[element.id]
    }
    
    console.log(element.event);
    //Lấy value của field từ element.event.target.value
    if (element.id === "description"){
        console.log(element);
        if(element.emojiInfo.emoji){
            newElement.value = newElement.value.toString().slice(0, element.emojiInfo.position) 
                                + element.event
                                + newElement.value.toString().slice(element.emojiInfo.position)                                
            console.log(newElement.value)
        }else{
            console.log(element.event)
            newElement.value = element.event;
        }
    }else if (element.id === "userTag" || element.id === "locationInput"){
        console.log(element.event)
        newElement.value = element.event;
    }else if(element.id === "dob"){
        console.log(element.event.target.valueAsNumber)
        newElement.value = element.event.target.value;
        newElement.valueAsNumber = moment(element.event.target.valueAsNumber).format()
    }else{
        newElement.value = element.event.target.value;
    }
  
    if(element.blur){
        //Kiểm tra value đc nhập vào field có hợp lệ không bằng hàm validate
        let validData = validate(newElement,formdata);
        //Cập nhật lại valid và validationMessage trong newElement
        newElement.valid = validData[0];
        newElement.validationMessage = validData[1];
    }

    newElement.touched = element.blur;
    //Thêm newElement vào State newFormdata
    newFormdata[element.id] = newElement;
    console.log(newFormdata[element.id])
    return newFormdata;
};

export const populateOptionFields= (formData,arrayData = [], field) => {
    const newArray = []
    const newFormData = {...formData};

    switch (field){
        case ('description'):
            arrayData.forEach(item => {
                newArray.push(item.name);
            })
            break;
        case ('userTag'):
            arrayData.forEach(item => {
                newArray.push(item.userName);
            })
            break;
        case ('locationInput'):
            arrayData.forEach(item => {
                newArray.push(item.name);
            })
            break;
        default:
            arrayData.forEach(item => {
                newArray.push({ key: item._id, value: item.name });
            })
            break;
    }
    newFormData[field].config.options = newArray;
    return newFormData;
}

export const resetFields = (formData,formName) => {
    const newFormData = {...formData};
    for(let key in newFormData){
        if(key==='images'){
            newFormData[key].value = [];
        }else{
            newFormData[key].value = '';
        }
        newFormData[key].valid = '';
        newFormData[key].touched = '';
        newFormData[key].validationMessage = '';
    }    
    return newFormData;
}

const hashtagOrWordRegex = /#*\w.*/g;
// Gets the word that the user's caret is positioned on.
const extractActiveWordOrHashtag = (content, caretIndex) => {
    // First, backtrack until we find a character that can't
    // be part of a word or hashtag.
    if(content !== undefined){
    let index = caretIndex-1;
    let character = content[index];
    //console.log(content);
    let res = '';
    do {
        //console.log(index,content[index]);
        let matches = content[index].match(hashtagOrWordRegex);
        // if this character is not part of a hashtag (e.g.
        // it's a space or a period), return the word or
        // hashtag in front of it.
        //console.log(index,matches)
        if (!matches || !matches.length) {
            res = content.slice(index+1, content.length)
            break;
        }
        // Otherwise, go to the previous character
        index -= 1
    } while (index > 0)
    return res;
    }
}

const nonEditingKeys = [
    'ArrowLeft',
    'ArrowRight',
    'Control',
    'Shift',
];

export const getActiveHashtag = (content, key, caretIndex) => {

    if (nonEditingKeys.includes(key)) {
        return null;
    }

    // Figure out what word or hashtag the user is editing
    // using the caret position and the content:
    const activeWordOrHashtag = extractActiveWordOrHashtag(content, caretIndex);
    console.log(activeWordOrHashtag);
    // if the word that the user is editing is a hashtag, return it.
    // otherwise, return null.
    //return activeWordOrHashtag[0] === '#' ? activeWordOrHashtag : null;
}
