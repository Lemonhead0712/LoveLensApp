interface StepsProps {
  steps: string[]
  currentStep: number
  className?: string
}

function Steps({ steps, currentStep, className = "" }: StepsProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                index + 1 <= currentStep ? "border-rose-500 bg-rose-500 text-white" : "border-gray-300 text-gray-500"
              }`}
            >
              {index + 1}
            </div>
            <div className="ml-2">
              <p className={`text-sm font-medium ${index + 1 <= currentStep ? "text-gray-900" : "text-gray-500"}`}>
                {step}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 ${index + 1 < currentStep ? "bg-rose-500" : "bg-gray-300"}`}
                style={{ width: "100px" }}
              ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Steps
