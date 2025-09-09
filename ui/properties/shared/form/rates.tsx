import { PropertyDocument } from "@/models";
import { ActionState } from "@/types";
import FormErrors from "@/ui/shared/form-errors";

interface RatesProps {
    actionState: ActionState;
    property?: PropertyDocument
}

const Rates = ({ actionState, property }: RatesProps) => (
    <div className="mb-4">
        <h2 className="form-section-label mb-1">
            Rates (enter at least one)
        </h2>
        <div
            className="flex flex-wrap mb-2 sm:mb-0"
            aria-describedby="rates-error"
        >
            <div className="w-full sm:w-1/3 mb-2 sm:mb-0 sm:pr-2">
                <label htmlFor="nightly_rate" className="sub-input-label">
                    Nightly
                </label>
                <input
                    type="number"
                    id="nightly_rate"
                    name="rates.nightly"
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500"
                    defaultValue={
                        (actionState.formData?.get("rates.nightly") || (
                            property ? property.rates.nightly : ""
                        )) as string
                    }                    
                    aria-describedby="nightly_rate-error"
                />
                {actionState.formErrorMap?.rates?.nightly &&
                    <FormErrors
                        errors={actionState.formErrorMap.rates.nightly}
                        id="nightly_rate"
                    />
                }
            </div>
            <div className="w-full sm:w-1/3 mb-2 sm:mb-0 sm:px-2">
                <label htmlFor="weekly_rate" className="sub-input-label">
                    Weekly
                </label>
                <input
                    type="number"
                    id="weekly_rate"
                    name="rates.weekly"
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500"
                    defaultValue={
                        (actionState.formData?.get("rates.weekly") || (
                            property ? property.rates.weekly : ""
                        )) as string
                    }                    
                    aria-describedby="weekly_rate-error"
                />
                {actionState.formErrorMap?.rates?.weekly &&
                    <FormErrors
                        errors={actionState.formErrorMap.rates.weekly}
                        id="weekly_rate"
                    />
                }
            </div>
            <div className="w-full sm:w-1/3 sm:pl-2">
                <label htmlFor="monthly_rate" className="sub-input-label">
                    Monthly
                </label>
                <input
                    type="number"
                    id="monthly_rate"
                    name="rates.monthly"
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500"
                    defaultValue={
                        (actionState.formData?.get("rates.monthly") || (
                            property ? property.rates.monthly : ""
                        )) as string
                    }                    
                    aria-describedby="monthly_rate-error"
                />
                {actionState.formErrorMap?.rates?.monthly &&
                    <FormErrors
                        errors={actionState.formErrorMap.rates.monthly}
                        id="monthly_rate"
                    />
                }
            </div>
        </div>
        {actionState.formErrorMap?.rates &&
            <FormErrors
                errors={actionState.formErrorMap.rates}
                id="rates"
            />
        }
    </div>
);
 
export default Rates;