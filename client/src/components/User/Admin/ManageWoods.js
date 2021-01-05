import React, { Component } from 'react';

import FormField from '../../ultils/Form/FormField';
import { update, generateData, ifFormValid, populateOptionFields, resetFields } from '../../ultils/Form/FormActions';

import { connect } from 'react-redux'
import { getWoods, addWoods } from '../../../actions/product_actions'

class ManageWoods extends Component {

    state = {
        formError: false,
        formSuccess: false,
        formData: {
            name: {
                element: 'input',
                value: '',
                config: {
                    name: 'name_input',
                    type: 'text',
                    placeholder: 'Enter wood name'
                },
                validation: {
                    required: true,
                },
                valid: false,
                touched: false,
                validationMessage: '',
            },
        }
    }

    showCategpryItems = () => (
        this.props.products.woods ?
            this.props.products.woods.map((item, i) => (
                <div className="category_Item" key={item._id}>
                    {item.name}
                </div>
            ))
            : null
    )
    updateForm = (element) => {
        const newFormdata = update(element, this.state.formData, 'brands');
        this.setState({
            formError: false,
            formData: newFormdata
        });
    }
    resetFielHandler = () => {
        const newFormData = resetFields(this.state.formData, 'woods');
        this.setState({
            formSuccess: true
        });
        // setTimeout(() => {
        //     this.setState({
        //         formSuccess: false
        //     }, () => { this.props.dispatch(clearProduct()) })
        // }, 3000)
    }
    submitForm = (event) => {

        event.preventDefault();

        let dataToSubmit = generateData(this.state.formData, 'woods');
        let formIsValid = ifFormValid(this.state.formData, 'woods');
        let existingWoods = this.props.products.woods;

        console.log(dataToSubmit);

        if (formIsValid) {
            console.log(dataToSubmit);
            this.props.dispatch(addWoods(dataToSubmit, existingWoods))
                .then(response => {
                    if (this.props.products.addWoods) {
                        this.resetFielHandler();
                    } else {
                        this.setState({ formError: true })
                    }
                })
        }
        else {
            this.setState({
                formError: true
            })

        }
    }

    componentDidMount() {
        this.props.dispatch(getWoods());
    }
    render() {
        return (
            <div className='admin_category_wrapper'>
                <h1>Wood</h1>
                <div className="admin_two_column">
                    <div className="left">
                        <div className="wood_container">
                            {this.showCategpryItems()}
                        </div>
                    </div>
                    <div className="right">
                        <form onSubmit={(event) => this.submitForm(event)}>
                            <FormField
                                id={'name'}
                                formData={this.state.formData.name}
                                change={(element) => this.updateForm(element)}
                            />

                            <button className='create__button' onClick={(event) => { this.submitForm(event) }}>
                                Add woods
                            </button>
                            {this.state.formError ?
                                <div className="errorLabel">
                                    PLease check yoour data!
                                </div>
                                : ''}
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        products: state.products
    }
}
export default connect(mapStateToProps)(ManageWoods);