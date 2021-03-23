import React, {Component} from 'react';
import './Contactcontainer.scss';
import axios from "axios";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";


interface Props{

}

class Contactcontainer extends Component<Props> {

    constructor(props: Props) {
        super(props);
        this.state ={
            name:'',
            email:'',
            subject:'',
            message:''
        }
    }

    onNameChange(event: any) {
        this.setState({name: event.target.value})
    }
    onEmailChange(event: any) {
        this.setState({email: event.target.value})
    }
    onSubjectChange(event: any) {
        this.setState({subject: event.target.value})
    }
    onMsgChange(event: any) {
        this.setState({message: event.target.value})
    }

    submitEmail(e: any){
        e.preventDefault();
        axios({
            method: "POST",
            url:"/send",
            data:  this.state
        }).then((response)=>{
            if (response.data.status === 'success'){
                alert("Message Sent.");
                this.resetForm()
            }else if(response.data.status === 'fail'){
                alert("Message failed to send.")
            }
        })
    }
    resetForm(){
        this.setState({name: '', email: '',subject:'', message: ''})
    }


    render() {
       return (
            <div id={`contact`} className="Contactcontainer">
                <Card className="card">
                    <CardMedia
                        className="media"
                        image={
                            "https://image.freepik.com/free-photo/river-foggy-mountains-landscape_1204-511.jpg"
                        }

                    />
                    <CardContent className="content">
                        <Typography
                            className={"MuiTypography--heading"}
                            variant={"h6"}
                            gutterBottom
                        >
                            Leave your number here
                        </Typography>
                        <Typography
                            className={"MuiTypography--subheading"}
                            variant={"caption"}
                        >
                            We are going to learn different kinds of species in nature that live
                            together to form amazing environment.
                        </Typography>
                        <Divider className="divider" light />
                    </CardContent>
                </Card>
            </div>
        );
    }

}

export default Contactcontainer;
