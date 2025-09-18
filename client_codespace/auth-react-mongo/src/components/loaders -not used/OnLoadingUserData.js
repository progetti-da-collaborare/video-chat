type Props = {
    isLoading: boolean;
    [key: string]: any;
}

type ConfigProps = {
    message: string;
    [key: string]: any;
}

const OnLoadingUserData = ({message, ...props}: ConfigProps) => (Component: any) => ({ isLoading, ...props2 } : Props) => {
        if (!isLoading) return <Component {...props2} />

        else return (
            <div>
                <h1>{message}</h1>
            </div>
        )
}

export default OnLoadingUserData