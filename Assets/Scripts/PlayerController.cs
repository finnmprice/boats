using UnityEngine;
using TMPro;

public class PlayerController : MonoBehaviour
{
    [SerializeField] float rotationSpeed = 5f;
    [SerializeField] float movementMultiplier = 2f;
    [SerializeField] Transform leftFirePoint;
    [SerializeField] Transform rightFirePoint;
    [SerializeField] float projectileSpeed = 2f;
    [SerializeField] float projectileTime = 2f;
    [SerializeField] GameObject position;
    [SerializeField] GameObject UI;
    Rigidbody2D rb;
    private float coins = 0f;
    private TextMeshProUGUI coinsText;

    void Start()
    {
        rb = GetComponent<Rigidbody2D>();
        GameObject coinsCanvas = GameObject.Find("Coins"); // Corrected line
        coinsText = coinsCanvas.GetComponentInChildren<TextMeshProUGUI>();
    }

    void Update()
    {
        RotatePlayer();

        UpdateMinimap();

        if (Input.GetMouseButtonDown(0))
        {
            FireProjectiles();
        }
    }

    void FixedUpdate()
    {
        MovePlayer();
    }

    void RotatePlayer()
    {
        GameObject playerSprite = GameObject.Find("Sprite");
        Vector3 mousePosition = Input.mousePosition;
        Vector3 mouseWorldPosition = Camera.main.ScreenToWorldPoint(mousePosition);

        Vector2 direction = new Vector2(mouseWorldPosition.x - playerSprite.transform.position.x, mouseWorldPosition.y - playerSprite.transform.position.y);

        float angleRadians = Mathf.Atan2(direction.y, direction.x);
        float angleDegrees = angleRadians * Mathf.Rad2Deg;
        Quaternion rotation = Quaternion.Euler(new Vector3(0f, 0f, angleDegrees));
        playerSprite.transform.rotation = Quaternion.Slerp(playerSprite.transform.rotation, rotation, rotationSpeed * Time.deltaTime);
    }

    void MovePlayer()
    {
        float horizontalAxis = Input.GetAxis("Horizontal");
        float verticalAxis = Input.GetAxis("Vertical");

        Vector2 movement = new Vector2(horizontalAxis, verticalAxis) * movementMultiplier * Time.fixedDeltaTime;
        Vector2 newPosition = rb.position + movement;

        newPosition.x = Mathf.Clamp(newPosition.x, -50f, 50f);
        newPosition.y = Mathf.Clamp(newPosition.y, -50f, 50f);

        rb.MovePosition(newPosition);
    }


    void FireProjectiles()
    {
        GameObject leftProjectile = Instantiate(Settings.instance.projectilePrefab, leftFirePoint.position, Quaternion.identity);
        Rigidbody2D leftRigidbody = leftProjectile.GetComponent<Rigidbody2D>();
        leftRigidbody.velocity = leftFirePoint.up * projectileSpeed;

        GameObject rightProjectile = Instantiate(Settings.instance.projectilePrefab, rightFirePoint.position, Quaternion.identity);
        Rigidbody2D rightRigidbody = rightProjectile.GetComponent<Rigidbody2D>();
        rightRigidbody.velocity = -rightFirePoint.up * projectileSpeed;

        Destroy(leftProjectile, projectileTime);
        Destroy(rightProjectile, projectileTime);
    }

    void UpdateMinimap() {
        if (rb != null && position != null) {
            float x = (rb.position.x + 50f) / 50 - 1;
            float y = (rb.position.y + 50f) / 50 - 1;
            position.transform.localPosition = new Vector3(x * 37.5f - 37.5f, y * 37.5f + 37.5f, position.transform.localPosition.z);
        }
    }

    public void IncreaseCoins(float value) {
        coins += value;
        coinsText.text = "$" + coins;
    }

}
