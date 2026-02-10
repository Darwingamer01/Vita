
async function test() {
    const payload = {
        title: "Test Hospital Verified",
        type: "HOSPITAL",
        description: "Testing verification level",
        location: {
            lat: 28.61,
            lng: 77.23,
            address: "Test Address",
            city: "Delhi",
            district: "New Delhi"
        },
        contact: {
            phone: "1234567890",
            email: ""
        },
        verificationLevel: "VERIFIED",
        metadata: {
            hospital: {
                beds: { general: 10, icu: 5, ventilator: 0, oxygen: 0 },
                specialties: [],
                insuranceAccepted: [],
                ayushmanBharat: true
            }
        }
    };

    console.log("Sending payload:", JSON.stringify(payload, null, 2));

    try {
        const response = await fetch('http://localhost:3000/api/resources', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("Response status:", response.status);
        console.log("Response data:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
}

test();
