import React from "react";
import {Image, ListGroup} from "react-bootstrap";

const Followee = props => {

    return (
        <ListGroup.Item>
            <div style={
                {
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                }
            }>
                <Image
                    src={props.profile_image}
                    roundedCircle
                    style={{
                        height: 50,
                        width: 50,
                        marginRight: '3%'
                    }}
                />
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start"
                }}>
                    <div>
                        {props.name}
                    </div>
                    <div className={"listening-status"}>
                        {props.listening_status}
                    </div>
                </div>

            </div>
        </ListGroup.Item>
    );
}
export default Followee;