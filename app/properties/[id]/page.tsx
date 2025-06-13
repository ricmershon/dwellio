interface PropertyPageProps {
    params: Promise<{ id: string }>,
}

const PropertyPage = async ( { params }: PropertyPageProps) => {
    const { id } = await params;
    return (
        <div>Property Page for {id}</div>
    );
}
 
export default PropertyPage;