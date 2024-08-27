type Props = {
    url: string | null | undefined;
    height : number;
    width : number;
}

function SimpleHTMLLoader(props : Props) {

    return (
        <div>
            <iframe src={!!props.url ? props.url : "/"} height={props.height} width={props.width}/>
        </div>
    )
}

export default SimpleHTMLLoader