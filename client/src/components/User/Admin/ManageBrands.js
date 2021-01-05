import React, { Component } from 'react';

import FormField from '../../ultils/Form/FormField';
import { update, generateData, ifFormValid, populateOptionFields, resetFields } from '../../ultils/Form/FormActions';

import { connect } from 'react-redux'
import { getBrands, addBrands } from '../../../actions/product_actions'


class ManageBrands extends Component {
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
                    placeholder: 'Enter brand name'
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
        this.props.products.brands ? 
        this.props.products.brands.map((item,i)=>(
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
    resetFielHandler = () =>{
        const newFormData = resetFields(this.state.formData, 'brands');
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

        let dataToSubmit = generateData(this.state.formData, 'brands');
        let formIsValid = ifFormValid(this.state.formData, 'brands');
        let existingBrands = this.props.products.brands;

        console.log(dataToSubmit);

        if (formIsValid) {
            console.log(dataToSubmit);
            this.props.dispatch(addBrands(dataToSubmit, existingBrands))
            .then(response => {
                if (this.props.products.addBrand){
                    this.resetFielHandler();
                }else{
                    this.setState({formError:true})
                }
            })
        }
        else {
            this.setState({
                formError: true
            })

        }
    }


    componentDidMount(){
        this.props.dispatch(getBrands());
    }
    render() {
        return (
            <div className='admin_category_wrapper'>
                <h1>Brand</h1>
                <div className="admin_two_column">
                    <div className="left">
                        <div className="brand_container">
                            {this.showCategpryItems()}
                        </div>
                    </div>
                    <div className="right">
                        <form onSubmit={(event) => this.submitForm(event)}>
                            <FormField
                                id={'name'}
                                formData={this.state.formData.name}
                                //Hàm change nhận vào một element và gọi đến hàm updateForm(element) 
                                change={(element) => this.updateForm(element)}
                            />

                            <button className='create__button' onClick={(event) => { this.submitForm(event) }}>
                                Add brands
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
export default connect(mapStateToProps)(ManageBrands);