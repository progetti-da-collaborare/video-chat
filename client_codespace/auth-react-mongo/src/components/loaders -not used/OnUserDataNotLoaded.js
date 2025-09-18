type Props2 = {
    persons: any;
    [key: string]: any;
}

type ConfigProps2 = {
    message: string;
    [key: string]: any;
}

const OnUserDataNotLoaded = ({message, ...props}: ConfigProps2) => (Component: any) => ({ persons, ...props2 } : Props2) => {
    const flag = persons;
    type Org = Record<string, any>;
    const org:Org = {};
    org.props2 = props2;
    org.persons = persons;
        if (!!flag) return <Component {...org} />

        else return (
            <div>
                <h1>{message}</h1>
            </div>
        )
}

export default OnUserDataNotLoaded