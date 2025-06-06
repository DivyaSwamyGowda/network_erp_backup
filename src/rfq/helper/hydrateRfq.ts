


export function hydrateRfq(rfq: any) {


    const rfqSpecifications = rfq.rfqSpecifications.map((rfqspec) => {
        return {
            id: rfqspec.id,
            value: rfqspec.value,
            specification: rfqspec.specification.name,
            spceId: rfqspec.specification.id


        }
    }
    )

    const services = rfq.services.map((service) => {
        return {
            id: service.id,
            isActive: service.isActive,
            name: service.name,



        }
    }
    )



    return {
        ...rfq,
        services, rfqSpecifications,File
    }




}