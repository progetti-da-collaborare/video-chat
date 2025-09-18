type Props = {
    persons: any;
    [key: string]: any;
}

type ConfigProps = {
    message: string;
    isMassive?:boolean;
    [key: string]: any;
}

const OnUserDataEmpty = ({message, isMassive, ...props}: ConfigProps) => (Component: any) => (props2: Props) => {
    const {persons} = props2;
        if (!!!isMassive || !!persons.length) return <Component {...props2} />

        else return (
            <div>
                <h1>{message}</h1>
            </div>
        )
}

export default OnUserDataEmpty