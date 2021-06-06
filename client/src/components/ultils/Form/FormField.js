import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import faExclamation from '@fortawesome/fontawesome-free-solid/faExclamation';
import faSmile from '@fortawesome/fontawesome-free-solid/faSmile';
import TextInput from 'react-autocomplete-input';
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'

class FormField extends Component{
    
    state={
        emojiToggle: false,
        selectedEmoji:'',
    }
    handleChange = (e) => {
        this.setState({ emojiToggle: !this.state.emojiToggle })
    }
    addEmoji = e => {
        const input = document.getElementById('description_textarea');
        console.log(input.selectionStart);
        const { formData, change, id } = this.props;
        let event = e.native;
        //Copy icon 
        var textfield = document.createElement("input");
        textfield.type="text"
        textfield.value = event;
        document.body.appendChild(textfield);
        textfield.select();
        textfield.setSelectionRange(0, 99999)
        document.execCommand("copy");
        document.body.removeChild(textfield);
    };

    showError = () => {
        const {formData} = this.props;
        if(formData.validation && !formData.valid)
        {
            if (formData.validationMessage){
                return (
                    <div>
                    <FontAwesomeIcon icon={faExclamation} style={{marginRight: '10px'}}/>
                        {formData.validationMessage}
                    </div>
                )
            }
        }
    }
   
     renderTemplate = () => {
        const { formData, change, id } = this.props;
        let formTemplate =null;
        switch(formData.element){
            case ('input'):
                formTemplate = (
                    <div className="formBlock" >
                        {  formData.showlabel?
                            <div className="label_input">{formData.config.label}</div>
                            :null
                        }
                        <input {...formData.config}
                            value={formData.value}
                            //sự kiện onBlur được dùng để validate required
                            onBlur={(event) => change({event,id,blur:true})}
                            //sự kiện change được dùng để validate email/password có pass đc Regex không
                            onChange={(event) => change({ event, id, blur: true })}
                        />
                        <div className="error_label" style={{ height: '20px', fontSize: '15px', marginTop: '5px', marginBottom: '5px', color: 'red', textTransform: 'capitalize' }}>
                            {this.showError()}
                        </div>
                        
                    </div>
                )
                break;
            case ('datetime'):
                formTemplate = (
                    <div className="formBlock" >
                        {  formData.showlabel?
                            <div className="label_input">{formData.config.label}</div>
                            :null
                        }

                        <input {...formData.config}
                            value={formData.value}
                            //sự kiện onBlur được dùng để validate required
                            onBlur={(event) => change({event,id,blur:true})}
                            //sự kiện change được dùng để validate email/password có pass đc Regex không
                            onChange={(event) => change({ event, id, blur: true })}
                        />

                        <div className="error_label" style={{ height: '20px', fontSize: '15px', marginTop: '5px', marginBottom: '5px', color: 'red', textTransform: 'capitalize' }}>
                            {this.showError()}
                        </div>
                        
                    </div>
                )
                break;
            case ('password'):
                formTemplate = (
                    <div className="formBlock" >
                        <input {...formData.config}
                            value={formData.value}
                            onBlur={(event) => change({ event, id, blur: true })}
                            onChange={(event) => change({ event, id, blur: true })}
                        />
                        <div className="error_label" style={{ height: '20px', fontSize: '15px',marginTop: '5px', marginBottom: '5px', color: 'red', textTransform: 'capitalize' }}>
                            {this.showError()}
                        </div>
                    </div>
                    
                )
                break;
            case('select'):
                formTemplate = (
                    <div className="formBlock" >
                        {  formData.showlabel ?
                            <div className="label_input">{formData.config.label}</div>
                            : null
                        }
                        <select
                            value={formData.value}
                            onBlur={(event) => change({ event, id, blur: true })}
                            onChange={(event) => change({ event, id })}
                        >
                            <option value="">Select one</option>
                            {
                                formData.config.options.map(item => (
                                    <option 
                                    key={item.key}
                                    value={item.key}>
                                    {item.value}
                                    </option>
                                ))
                            }
                        </select>
                         <div className="error_label" style={{ height: '20px', fontSize: '15px', marginTop: '5px', marginBottom: '5px', color: 'red', textTransform: 'capitalize' }}>
                            {this.showError()}
                        </div> 
                    </div>
                )
            break;
            case ('textarea'):
                formTemplate = (
                    <div className="formBlock" >
                        {  formData.showlabel ?
                            <div className="label_input">{formData.config.label}</div>
                            : null
                        }
                        <textarea {...formData.config}
                            value={formData.value}
                            onBlur={(event) => change({ event, id, blur: true })}
                            onChange={(event) => change({ event, id })}
                        />
                        {this.showError()}
                    </div>
                )
                break; 
            case ('description'):
                formTemplate = (
                    <div className="formBlock" >
                        <div className="description_input">
                            <TextInput
                                id="description_textarea"
                                className="description_textarea"
                                placeholder={formData.config.placeholder}
                                options={formData.config.options}
                                defaultValue={formData.value}
                                trigger="#"
                                onChange={(event) => { 
                                    console.log(event);
                                    change({ event, emojiInfo: { emoji: false } , id })
                                }}
                                maxOptions={7}
                            /> 
                            <FontAwesomeIcon icon={faSmile} class="emoji_button" onClick={this.handleChange}></FontAwesomeIcon>
                            {
                            this.state.emojiToggle ?
                                <Picker style={{position: "absolute", right: 0,top: "100%",}} onSelect={this.addEmoji} />
                            :null
                            }
                        </div>
                    </div>);
                break;
            case ('userTag'):
                formTemplate = (
                    <div className="formBlock" >
                        {
                            formData.showlabel ?
                                <div className="label_input">{formData.config.label}</div>
                                : null
                        }
                        <TextInput
                            Component="input"
                            placeholder={formData.config.placeholder}
                            options={formData.config.options}
                            trigger="@"
                            defaultValue={formData.value}
                            // onChange={this.handleChange}
                            onChange={(event) => {
                                console.log(event);
                                change({ event, id })
                            }}
                            maxOptions={7}
                        />
                    </div>);
                break;
            case ('locationInput'):
                formTemplate = (
                    <div className="formBlock" >
                        {
                            formData.showlabel ?
                                <div className="label_input">{formData.config.label}</div>
                                : null
                        }
                        <TextInput
                            Component="input"
                            placeholder={formData.config.placeholder}
                            options={formData.config.options}
                            trigger="#"
                            onChange={(event) => {
                                console.log(event);
                                change({ event,id })
                            }}
                            maxOptions={3}
                        />
                    </div>);
                break;
            default:
                formTemplate = null;

        }
        return formTemplate;
    }
    
    render(){
        return (
            <div class="formField_container">
                {this.renderTemplate()}
            </div>
        );
    }
};

export default FormField;